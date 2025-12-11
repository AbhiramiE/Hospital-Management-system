from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:admin123@localhost/hospital_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)



class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Patient(db.Model):
    __tablename__ = 'patients'
    patient_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(15))
    
    def to_dict(self):
        return {
            'id': self.patient_id,
            'name': f"{self.first_name} {self.last_name}",
            'phone': self.phone,
            'gender': self.gender
        }

class Doctor(db.Model):
    __tablename__ = 'doctors'
    doctor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    specialization = db.Column(db.String(100))

    def to_dict(self):
        return {
            'id': self.doctor_id,
            'name': f"Dr. {self.first_name} {self.last_name}",
            'specialization': self.specialization
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    appointment_id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id'))
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.doctor_id'))
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='Scheduled')
    reason = db.Column(db.Text)
   
    patient = db.relationship('Patient', backref='appointments')
    doctor = db.relationship('Doctor', backref='appointments')

    def to_dict(self):
        return {
            'id': self.appointment_id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}",
            'doctor_name': f"Dr. {self.doctor.first_name} {self.doctor.last_name}",
            'date': self.appointment_date.strftime('%Y-%m-%d %H:%M'),
            'status': self.status,
            'reason': self.reason or 'N/A'
        }

class Billing(db.Model):
    __tablename__ = 'billing'
    bill_id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id'))
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.appointment_id'))
    amount = db.Column(db.Numeric(10, 2))
    billing_type = db.Column(db.String(30), nullable=False)
    description = db.Column(db.Text)
    payment_status = db.Column(db.String(20))
    generated_date = db.Column(db.DateTime)

    patient = db.relationship('Patient', backref='bills')
    appointment = db.relationship('Appointment', backref='bill')

    def to_dict(self):
        return {
            'id': self.bill_id,
            'patient': f"{self.patient.first_name} {self.patient.last_name}",
            'amount': float(self.amount),
            'type': self.billing_type,
            'description': self.description,
            'status': self.payment_status,
            'date': self.generated_date.strftime('%Y-%m-%d') if self.generated_date else 'N/A'
        }

class Room(db.Model):
    __tablename__ = 'rooms'
    room_id = db.Column(db.Integer, primary_key=True)
    room_number = db.Column(db.String(10), unique=True, nullable=False)
    room_type = db.Column(db.String(20), nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    is_occupied = db.Column(db.Boolean, default=False)
    price_per_day = db.Column(db.Numeric(10, 2), nullable=False)

    def to_dict(self):
        return {
            'id': self.room_id,
            'room_number': self.room_number,
            'room_type': self.room_type,
            'floor': self.floor,
            'is_occupied': self.is_occupied,
            'price_per_day': float(self.price_per_day)
        }

class PatientRoom(db.Model):
    __tablename__ = 'patientrooms'
    assignment_id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id'))
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.room_id'))
    check_in_date = db.Column(db.DateTime, default=datetime.now)
    check_out_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Active')

    patient = db.relationship('Patient', backref='room_assignments')
    room = db.relationship('Room', backref='assignments')

    def to_dict(self):
        return {
            'id': self.assignment_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}",
            'patient_id': self.patient_id,
            'room_number': self.room.room_number,
            'room_id': self.room_id,
            'check_in_date': self.check_in_date.strftime('%Y-%m-%d %H:%M') if self.check_in_date else None,
            'check_out_date': self.check_out_date.strftime('%Y-%m-%d %H:%M') if self.check_out_date else None,
            'status': self.status
        }


class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    prescription_id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.appointment_id'), unique=True, nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id'))
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.doctor_id'))
    diagnosis = db.Column(db.Text, nullable=False)
    medicines = db.Column(db.Text, nullable=False)
    dosage = db.Column(db.Text)
    notes = db.Column(db.Text)
    prescribed_date = db.Column(db.DateTime, default=datetime.now)

    patient = db.relationship('Patient', backref='prescriptions')
    doctor = db.relationship('Doctor', backref='prescriptions')
    appointment = db.relationship('Appointment', backref='prescription', uselist=False)

    def to_dict(self):
        return {
            'id': self.prescription_id,
            'appointment_id': self.appointment_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}",
            'patient_id': self.patient_id,
            'doctor_name': f"Dr. {self.doctor.first_name} {self.doctor.last_name}",
            'doctor_specialization': self.doctor.specialization,
            'diagnosis': self.diagnosis,
            'medicines': self.medicines,
            'dosage': self.dosage,
            'notes': self.notes,
            'date': self.prescribed_date.strftime('%Y-%m-%d %H:%M') if self.prescribed_date else None
        }



@app.route('/')
def home():
    return "Hospital API Live"

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username, password_hash=password).first()
    
    if user:
        return jsonify({'role': user.role.lower(), 'username': user.username}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.order_by(Patient.patient_id.desc()).all()
    return jsonify([p.to_dict() for p in patients])

@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.json
    try:
        new_patient = Patient(
            first_name=data['firstName'],
            last_name=data['lastName'],
            gender=data['gender'],
            phone=data['phone']
        )
        db.session.add(new_patient)
        db.session.flush()
        
        
        bill_amount = data.get('billAmount')
        if bill_amount and float(bill_amount) > 0:
            new_bill = Billing(
                patient_id=new_patient.patient_id,
                amount=bill_amount,
                billing_type='Other',
                description='Patient registration and initial consultation',
                payment_status='Pending',
                generated_date=datetime.now()
            )
            db.session.add(new_bill)

        db.session.commit()
        return jsonify({"message": "Success"}), 201
    except KeyError as e:
        db.session.rollback()
        print(f"Missing field: {str(e)}")
        print(f"Received data: {data}")
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error adding patient: {str(e)}")
        print(f"Received data: {data}")
        return jsonify({"error": str(e)}), 400


@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([d.to_dict() for d in doctors])


@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    appointments = Appointment.query.order_by(Appointment.appointment_date.desc()).all()
    return jsonify([a.to_dict() for a in appointments])

@app.route('/api/appointments', methods=['POST'])
def add_appointment():
    data = request.json
    try:
        new_appt = Appointment(
            patient_id=data['patientId'],
            doctor_id=data['doctorId'],
            appointment_date=datetime.strptime(data['date'], '%Y-%m-%dT%H:%M'),
            status='Scheduled'
        )
        db.session.add(new_appt)
        db.session.commit()
        return jsonify({"message": "Appointment created"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/appointments/<int:appointment_id>/complete', methods=['PATCH'])
def complete_appointment(appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        # Mark appointment as completed
        appointment.status = 'Completed'
        
        # Auto-generate billing for appointment fee (if not already billed)
        existing_bill = Billing.query.filter_by(appointment_id=appointment_id).first()
        if not existing_bill:
            # Set appointment fee based on doctor specialization
            appointment_fee = 1500.00  # Default fee
            if appointment.doctor.specialization == 'Neurologist':
                appointment_fee = 2000.00
            elif appointment.doctor.specialization == 'Surgeon':
                appointment_fee = 2500.00
            
            bill = Billing(
                patient_id=appointment.patient_id,
                appointment_id=appointment_id,
                amount=appointment_fee,
                billing_type='Appointment Fee',
                description=f"Consultation with {appointment.doctor.first_name} {appointment.doctor.last_name} - {appointment.doctor.specialization}",
                payment_status='Pending',
                generated_date=datetime.now()
            )
            db.session.add(bill)
        
        db.session.commit()
        return jsonify({"message": "Appointment marked as completed and bill generated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"message": "Appointment deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/api/billing', methods=['GET'])
def get_billing():
    bills = Billing.query.order_by(Billing.bill_id.desc()).all()
    return jsonify([b.to_dict() for b in bills])

@app.route('/api/billing/<int:bill_id>/mark-paid', methods=['PATCH'])
def mark_bill_paid(bill_id):
    try:
        bill = Billing.query.get(bill_id)
        if not bill:
            return jsonify({"error": "Bill not found"}), 404
        
        if bill.payment_status == 'Paid':
            return jsonify({"message": "Bill is already paid"}), 200
        
        bill.payment_status = 'Paid'
        db.session.commit()
        
        return jsonify({"message": "Bill marked as paid successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_revenue = db.session.query(func.sum(Billing.amount)).scalar() or 0
    return jsonify({
        'patients': Patient.query.count(),
        'doctors': Doctor.query.count(),
        'appointments': Appointment.query.count(),
        'revenue': float(total_revenue) 
    })


@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.order_by(Room.room_number).all()
    return jsonify([r.to_dict() for r in rooms])

@app.route('/api/rooms/book', methods=['POST'])
def book_room():
    data = request.json
    try:
        room = Room.query.get(data['roomId'])
        if not room:
            return jsonify({"error": "Room not found"}), 404
        
        if room.is_occupied:
            return jsonify({"error": "Room is already occupied"}), 400
        
        patient = Patient.query.get(data['patientId'])
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        # Create room assignment
        assignment = PatientRoom(
            patient_id=data['patientId'],
            room_id=data['roomId'],
            status='Active'
        )
        
        # Mark room as occupied
        room.is_occupied = True
        
        # Auto-generate billing for room booking (first day charge)
        bill = Billing(
            patient_id=data['patientId'],
            appointment_id=None,
            amount=room.price_per_day,
            billing_type='Room Charge',
            description=f"Room {room.room_number} ({room.room_type}) - Day 1 Charge",
            payment_status='Pending',
            generated_date=datetime.now()
        )
        
        db.session.add(assignment)
        db.session.add(bill)
        db.session.commit()
        
        return jsonify({"message": "Room booked successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/rooms/<int:room_id>/checkout', methods=['PATCH'])
def checkout_room(room_id):
    try:
        # Find active assignment for this room
        assignment = PatientRoom.query.filter_by(
            room_id=room_id, 
            status='Active'
        ).first()
        
        if not assignment:
            return jsonify({"error": "No active assignment found"}), 404
        
        # Update assignment
        assignment.check_out_date = datetime.now()
        assignment.status = 'Completed'
        
        # Mark room as available
        room = Room.query.get(room_id)
        room.is_occupied = False
        
        db.session.commit()
        return jsonify({"message": "Checkout successful"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/room-assignments', methods=['GET'])
def get_room_assignments():
    assignments = PatientRoom.query.filter_by(status='Active').all()
    return jsonify([a.to_dict() for a in assignments])


# Prescription endpoints
@app.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    prescriptions = Prescription.query.order_by(Prescription.prescribed_date.desc()).all()
    return jsonify([p.to_dict() for p in prescriptions])

@app.route('/api/prescriptions', methods=['POST'])
def add_prescription():
    data = request.json
    
    # Validate appointment_id is provided
    if not data.get('appointmentId'):
        return jsonify({"error": "Appointment ID is required"}), 400
    
    # Check if appointment exists
    appointment = Appointment.query.get(data['appointmentId'])
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404
    
    # Check if prescription already exists for this appointment
    existing = Prescription.query.filter_by(appointment_id=data['appointmentId']).first()
    if existing:
        return jsonify({"error": "Prescription already exists for this appointment"}), 400
    
    try:
        new_prescription = Prescription(
            appointment_id=data['appointmentId'],
            patient_id=data['patientId'],
            doctor_id=data['doctorId'],
            diagnosis=data['diagnosis'],
            medicines=data['medicines'],
            dosage=data.get('dosage', ''),
            notes=data.get('notes', '')
        )
        db.session.add(new_prescription)
        db.session.commit()
        return jsonify({"message": "Prescription added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/prescriptions/appointment/<int:appointment_id>', methods=['GET'])
def get_prescription_by_appointment(appointment_id):
    prescription = Prescription.query.filter_by(appointment_id=appointment_id).first()
    if prescription:
        return jsonify(prescription.to_dict()), 200
    return jsonify({"message": "No prescription found"}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)
