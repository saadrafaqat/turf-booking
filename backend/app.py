from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------- DATABASE MODELS ----------
class Turf(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Slot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    turf_id = db.Column(db.Integer, db.ForeignKey('turf.id'), nullable=False)
    time_label = db.Column(db.String(50), nullable=False)  # e.g. "6:00 AM - 8:00 AM"
    price = db.Column(db.Integer, nullable=False)
    is_morning = db.Column(db.Boolean, default=False)
    turf = db.relationship('Turf', backref='slots')

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    turf_id = db.Column(db.Integer, db.ForeignKey('turf.id'), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey('slot.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_email = db.Column(db.String(100))
    transaction_id = db.Column(db.String(100), nullable=False)
    payment_method = db.Column(db.String(20), default='easypaisa')
    booking_date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    turf = db.relationship('Turf', backref='bookings')
    slot = db.relationship('Slot', backref='bookings')

# ---------- INIT DATA ----------
def init_data():
    with app.app_context():
        db.create_all()
        if Turf.query.count() == 0:
            turf1 = Turf(name='Turf A - Premium Ground')
            turf2 = Turf(name='Turf B - Classic Ground')
            db.session.add(turf1)
            db.session.add(turf2)
            db.session.flush()

            slots_turf1 = [
                Slot(turf_id=turf1.id, time_label='6:00 AM - 8:00 AM', price=100, is_morning=True),
                Slot(turf_id=turf1.id, time_label='9:00 AM - 11:00 AM', price=2000, is_morning=False),
                Slot(turf_id=turf1.id, time_label='4:00 PM - 6:00 PM', price=2000, is_morning=False),
                Slot(turf_id=turf1.id, time_label='7:00 PM - 9:00 PM', price=2000, is_morning=False),
            ]
            slots_turf2 = [
                Slot(turf_id=turf2.id, time_label='6:00 AM - 8:00 AM', price=100, is_morning=True),
                Slot(turf_id=turf2.id, time_label='9:00 AM - 11:00 AM', price=2000, is_morning=False),
                Slot(turf_id=turf2.id, time_label='4:00 PM - 6:00 PM', price=2000, is_morning=False),
                Slot(turf_id=turf2.id, time_label='7:00 PM - 9:00 PM', price=2000, is_morning=False),
            ]
            for slot in slots_turf1 + slots_turf2:
                db.session.add(slot)
            db.session.commit()

# ---------- API ROUTES ----------

@app.route('/api/turfs', methods=['GET'])
def get_turfs():
    turfs = Turf.query.all()
    result = []
    for turf in turfs:
        result.append({
            'id': turf.id,
            'name': turf.name,
            'slots': [{
                'id': slot.id,
                'time_label': slot.time_label,
                'price': slot.price,
                'is_morning': slot.is_morning
            } for slot in turf.slots]
        })
    return jsonify(result)

@app.route('/api/availability', methods=['GET'])
def get_availability():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    turfs = Turf.query.all()
    result = []
    for turf in turfs:
        turf_data = {'id': turf.id, 'name': turf.name, 'slots': []}
        for slot in turf.slots:
            booked = Booking.query.filter_by(
                turf_id=turf.id,
                slot_id=slot.id,
                booking_date=date
            ).first() is not None
            turf_data['slots'].append({
                'id': slot.id,
                'time_label': slot.time_label,
                'price': slot.price,
                'is_morning': slot.is_morning,
                'booked': booked
            })
        result.append(turf_data)
    return jsonify(result)

@app.route('/api/book', methods=['POST'])
def book_slot():
    data = request.json
    turf_id = data.get('turf_id')
    slot_id = data.get('slot_id')
    date = data.get('date')
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email')
    transaction_id = data.get('transaction_id')

    # Check if slot already booked
    existing = Booking.query.filter_by(
        turf_id=turf_id,
        slot_id=slot_id,
        booking_date=date
    ).first()
    if existing:
        return jsonify({'success': False, 'message': 'This slot is already booked!'})

    booking = Booking(
        turf_id=turf_id,
        slot_id=slot_id,
        customer_name=name,
        customer_phone=phone,
        customer_email=email,
        transaction_id=transaction_id,
        booking_date=date
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Booking confirmed! Enjoy your game!'})

@app.route('/api/verify_transaction', methods=['POST'])
def verify_transaction():
    data = request.json
    # In production, you'd validate with EasyPaisa API.
    # For demo, we accept any non-empty transaction ID.
    txn_id = data.get('transaction_id', '').strip()
    if len(txn_id) >= 4:
        return jsonify({'valid': True})
    return jsonify({'valid': False, 'message': 'Transaction ID must be at least 4 characters'})

if __name__ == '__main__':
    init_data()
    app.run(debug=True, port=5000)
