w

# Prescription endpoints
@app.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    prescriptions = Prescription.query.order_by(Prescription.prescribed_date.desc()).all()
    return jsonify([p.to_dict() for p in prescriptions])

@app.route('/api/prescriptions', methods=['POST'])
def add_prescription():
    data = request.json
    try:
        new_prescription = Prescription(
            appointment_id=data.get('appointmentId'),
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
