
DROP TABLE IF EXISTS PatientRooms CASCADE;
DROP TABLE IF EXISTS Rooms CASCADE;
DROP TABLE IF EXISTS Billing CASCADE;
DROP TABLE IF EXISTS Appointments CASCADE;
DROP TABLE IF EXISTS Patients CASCADE;
DROP TABLE IF EXISTS Doctors CASCADE;
DROP TABLE IF EXISTS Users CASCADE;


CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin', 'Doctor')) NOT NULL
);


CREATE TABLE Doctors (
    doctor_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100)
);


CREATE TABLE Patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(15)
);


CREATE TABLE Appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES Patients(patient_id),
    doctor_id INT REFERENCES Doctors(doctor_id),
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    reason TEXT
);


CREATE TABLE Billing (
    bill_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES Patients(patient_id),
    appointment_id INT REFERENCES Appointments(appointment_id),
    amount DECIMAL(10, 2),
    billing_type VARCHAR(30) CHECK (billing_type IN ('Appointment Fee', 'Room Charge', 'Treatment', 'Other')) NOT NULL,
    description TEXT,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Insurance')),
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(20) CHECK (room_type IN ('General', 'Private', 'ICU', 'Emergency')) NOT NULL,
    floor INT CHECK (floor >= 1 AND floor <= 10) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    price_per_day DECIMAL(10, 2) CHECK (price_per_day >= 0) NOT NULL
);


CREATE TABLE PatientRooms (
    assignment_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES Patients(patient_id),
    room_id INT REFERENCES Rooms(room_id),
    check_in_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed')) NOT NULL,
    CONSTRAINT check_dates CHECK (check_out_date IS NULL OR check_out_date > check_in_date)
);


CREATE TABLE Prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    appointment_id INT UNIQUE NOT NULL REFERENCES Appointments(appointment_id),
    patient_id INT REFERENCES Patients(patient_id),
    doctor_id INT REFERENCES Doctors(doctor_id),
    diagnosis TEXT NOT NULL,
    medicines TEXT NOT NULL,
    dosage TEXT,
    notes TEXT,
    prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO Users (username, password_hash, role) VALUES 
('admin', 'admin123', 'Admin'),
('dr_house', 'pass123', 'Doctor'),
('dr_strange', 'pass123', 'Doctor');


INSERT INTO Doctors (first_name, last_name, specialization) VALUES 
('Gregory', 'House', 'Surgeon'),
('Stephen', 'Strange', 'Neurologist');


INSERT INTO Patients (first_name, last_name, gender, phone) VALUES 
('John', 'Doe', 'Male', '555-0101'),
('Jane', 'Smith', 'Female', '555-0102'),
('Bob', 'Johnson', 'Male', '555-0103');

INSERT INTO Appointments (patient_id, doctor_id, appointment_date, status, reason) VALUES 
(1, 1, '2023-11-20 10:00:00', 'Scheduled', 'Checkup'),
(2, 2, '2023-11-21 14:30:00', 'Scheduled', 'Migraine'),
(3, 1, '2023-11-19 09:00:00', 'Completed', 'Heart Palpitations');


INSERT INTO Rooms (room_number, room_type, floor, is_occupied, price_per_day) VALUES 
('101', 'General', 1, FALSE, 1500.00),
('102', 'General', 1, FALSE, 1500.00),
('103', 'Private', 1, FALSE, 3000.00),
('201', 'ICU', 2, FALSE, 5000.00),
('202', 'ICU', 2, FALSE, 5000.00),
('203', 'Private', 2, FALSE, 3000.00),
('301', 'Emergency', 3, FALSE, 2000.00),
('302', 'General', 3, FALSE, 1500.00);


INSERT INTO Billing (patient_id, appointment_id, amount, billing_type, description, payment_status, generated_date) VALUES 
(1, 1, 1500.00, 'Appointment Fee', 'General Checkup Consultation', 'Paid', '2023-11-20 10:00:00'),
(2, 2, 2000.00, 'Appointment Fee', 'Neurologist Consultation for Migraine', 'Pending', '2023-11-21 14:30:00'),
(3, 3, 1500.00, 'Appointment Fee', 'Cardiac Consultation', 'Paid', '2023-11-19 09:00:00'),
(3, NULL, 5000.00, 'Treatment', 'ECG and Blood Tests', 'Paid', '2023-11-19 10:00:00');


INSERT INTO Prescriptions (appointment_id, patient_id, doctor_id, diagnosis, medicines, dosage, notes, prescribed_date) VALUES 
(3, 3, 1, 'Heart Palpitations - Anxiety induced', 'Beta Blocker (Propranolol), Vitamin B Complex', 'Propranolol 10mg twice daily, B Complex once daily', 'Avoid caffeine and stress. Follow up in 2 weeks.', '2023-11-19 09:30:00'),
(1, 1, 1, 'General Health Check - All Normal', 'Multivitamin', 'One tablet daily after breakfast', 'Continue healthy lifestyle. Annual checkup recommended.', '2023-11-20 10:30:00');