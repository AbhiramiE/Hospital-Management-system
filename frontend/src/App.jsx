import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Activity, LogOut, UserPlus, 
  Stethoscope, IndianRupee, LayoutDashboard, 
  AlertCircle, RefreshCw, Database, WifiOff,
  ChevronRight, Bell, Lock, User, Plus, ArrowLeft, Clock, CheckCircle, Trash2, Home, Building2, FileText, Pill
} from 'lucide-react';



export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, revenue: 0 });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]); // New state for doctors dropdown
  const [appointments, setAppointments] = useState([]); 
  const [bills, setBills] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

 
  const refreshData = async () => {
    setLoading(true);
    try {
      const [statsRes, patRes, docRes, apptRes, roomRes, prescrRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/stats'),
        fetch('http://127.0.0.1:5000/api/patients'),
        fetch('http://127.0.0.1:5000/api/doctors'),
        fetch('http://127.0.0.1:5000/api/appointments'),
        fetch('http://127.0.0.1:5000/api/rooms'),
        fetch('http://127.0.0.1:5000/api/prescriptions')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (patRes.ok) setPatients(await patRes.json());
      if (docRes.ok) setDoctors(await docRes.json());
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (roomRes.ok) setRooms(await roomRes.json());
      if (prescrRes.ok) setPrescriptions(await prescrRes.json());

      if (user === 'admin') {
        const billRes = await fetch('http://127.0.0.1:5000/api/billing');
        if (billRes.ok) setBills(await billRes.json());
      }
      
    } catch (error) {
      console.error("Connection Failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user} logout={() => setUser(null)} />
      
      <main className="flex-1 md:ml-64 p-8 w-full transition-all duration-300 ease-in-out">
        <Header activeTab={activeTab} onRefresh={refreshData} loading={loading} user={user} />

        <div className="max-w-7xl mx-auto animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard stats={stats} />}
          {activeTab === 'patients' && <PatientList patients={patients} onPatientAdded={refreshData} />}
          {activeTab === 'appointments' && <AppointmentList appointments={appointments} patients={patients} doctors={doctors} onAdd={refreshData} />}
          {activeTab === 'rooms' && <RoomManagement rooms={rooms} patients={patients} onUpdate={refreshData} />}
          {activeTab === 'prescriptions' && <PrescriptionManagement prescriptions={prescriptions} patients={patients} doctors={doctors} appointments={appointments} onUpdate={refreshData} />}
          {activeTab === 'billing' && <BillingView bills={bills} onUpdate={refreshData} />}
        </div>
      </main>
    </div>
  );
}



const Sidebar = ({ activeTab, setActiveTab, userRole, logout }) => (
  <aside className="w-64 bg-slate-900 text-white flex-shrink-0 fixed h-full left-0 top-0 z-20 hidden md:flex flex-col shadow-xl">
    <div className="p-6 border-b border-slate-800 flex items-center gap-3">
      <Activity className="text-teal-400" size={28} />
      <h1 className="text-xl font-bold tracking-wider uppercase">Medicare</h1>
    </div>
    
    <nav className="flex-1 p-4 space-y-2 mt-4">
      <NavBtn label="Dashboard" icon={LayoutDashboard} id="dashboard" active={activeTab} set={setActiveTab} />
      <NavBtn label="Patients" icon={Users} id="patients" active={activeTab} set={setActiveTab} />
      <NavBtn label="Appointments" icon={Calendar} id="appointments" active={activeTab} set={setActiveTab} />
      <NavBtn label="Prescriptions" icon={FileText} id="prescriptions" active={activeTab} set={setActiveTab} />
      <NavBtn label="Rooms" icon={Building2} id="rooms" active={activeTab} set={setActiveTab} />
      {userRole === 'admin' && (
         <NavBtn label="Billing & Finance" icon={IndianRupee} id="billing" active={activeTab} set={setActiveTab} />
      )}
    </nav>

    <div className="p-4 border-t border-slate-800">
      <button onClick={logout} className="w-full flex items-center gap-3 text-slate-400 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-slate-800">
        <LogOut size={20} /> 
        <span>Sign Out</span>
      </button>
    </div>
  </aside>
);

const NavBtn = ({ label, icon: Icon, id, active, set }) => (
  <button
    onClick={() => set(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active === id 
        ? 'bg-teal-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Header = ({ activeTab, onRefresh, loading, user }) => (
  <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-slate-800 capitalize mb-1">{activeTab}</h1>
      <p className="text-slate-500 text-sm">Logged in as: <span className="font-bold capitalize text-teal-600">{user}</span></p>
    </div>
    <div className="flex items-center gap-3">
      <button 
        onClick={onRefresh} 
        disabled={loading}
        className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm"
        title="Refresh Data"
      >
        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
      </button>
      <div className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-sm font-medium text-slate-600">System Online</span>
      </div>
    </div>
  </header>
);

const Dashboard = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
    <StatCard title="Total Patients" value={stats.patients} icon={Users} color="text-blue-600" bg="bg-blue-50" />
    <StatCard title="Doctors On Duty" value={stats.doctors} icon={Stethoscope} color="text-teal-600" bg="bg-teal-50" />
    <StatCard title="Appointments" value={stats.appointments} icon={Calendar} color="text-purple-600" bg="bg-purple-50" />
    <StatCard title="Revenue" value={`₹${stats.revenue}`} icon={IndianRupee} color="text-amber-600" bg="bg-amber-50" />
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
    <div>
      <p className="text-slate-500 font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${bg} ${color}`}>
      <Icon size={28} />
    </div>
  </div>
);

const PatientList = ({ patients, onPatientAdded }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', gender: 'Male', phone: '', billAmount: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName) return alert("Name required");
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ firstName: '', lastName: '', gender: 'Male', phone: '', billAmount: '' });
        onPatientAdded();
      } else alert("Save failed");
    } catch (err) { alert("Server error"); } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="font-bold text-lg text-slate-800">Patient Records</h2>
          <p className="text-sm text-slate-500">Manage patient details</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-all">
          <UserPlus size={18} /> Add Patient
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="First Name" className="p-3 border rounded-lg" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            <input placeholder="Last Name" className="p-3 border rounded-lg" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            <select className="p-3 border rounded-lg bg-white" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
            <input 
              placeholder="Phone Number" 
              className="p-3 border rounded-lg" 
              value={form.phone} 
              onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '')})}
              maxLength={15}
            />
            <div className="relative col-span-1 md:col-span-2">
              <IndianRupee className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                placeholder="Initial Bill Amount (Optional)" 
                className="p-3 pl-10 border rounded-lg w-full border-teal-200 focus:ring-2 focus:ring-teal-500" 
                value={form.billAmount} 
                onChange={(e) => setForm({...form, billAmount: e.target.value.replace(/\D/g, '')})}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={submitting} className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
              {submitting ? "Saving..." : "Save Record"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-slate-600 px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
            <tr><th className="p-5">ID</th><th className="p-5">Name</th><th className="p-5">Gender</th><th className="p-5">Contact</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5 text-slate-500">#{p.id}</td>
                <td className="p-5 font-medium text-slate-900">{p.name}</td>
                <td className="p-5 text-slate-600">{p.gender}</td>
                <td className="p-5 text-slate-600">{p.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AppointmentList = ({ appointments, patients, doctors, onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleAdd = async () => {
    if (!form.patientId || !form.doctorId || !form.date) return alert("All fields required");
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ patientId: '', doctorId: '', date: '' });
        onAdd();
      } else alert("Failed. Ensure IDs are correct.");
    } catch (err) { alert("Server error"); } finally { setSubmitting(false); }
  };

  const handleComplete = async (appointmentId) => {
    setCompleting(appointmentId);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/appointments/${appointmentId}/complete`, {
        method: 'PATCH'
      });
      if (res.ok) {
        onAdd(); // Refresh the appointments list
      } else {
        alert("Failed to update appointment status");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setCompleting(null);
    }
  };

  const handleDelete = async (appointmentId, patientName) => {
    if (!confirm(`Are you sure you want to delete the appointment for ${patientName}?`)) {
      return;
    }
    
    setDeleting(appointmentId);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onAdd(); // Refresh the appointments list
      } else {
        alert("Failed to delete appointment");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-lg text-slate-800">Appointments</h2>
              <p className="text-sm text-slate-500">Scheduled visits</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-all">
             <Plus size={18} /> New Appointment
            </button>
        </div>

        {showForm && (
        <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select className="p-3 border rounded-lg bg-white" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="p-3 border rounded-lg bg-white" value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
            </select>
            <input type="datetime-local" className="p-3 border rounded-lg bg-white" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <button onClick={handleAdd} disabled={submitting} className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
             {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
              <tr><th className="p-5">Date</th><th className="p-5">Patient</th><th className="p-5">Doctor</th><th className="p-5">Status</th><th className="p-5">Action</th><th className="p-5">Remove</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                 <tr><td colSpan="6" className="p-12 text-center text-slate-400">No appointments scheduled.</td></tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 text-slate-600 flex items-center gap-2"><Clock size={16}/> {a.date}</td>
                    <td className="p-5 font-medium text-slate-900">{a.patient_name}</td>
                    <td className="p-5 text-slate-600">{a.doctor_name}</td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        a.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        a.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-5">
                      {a.status === 'Scheduled' && (
                        <button
                          onClick={() => handleComplete(a.id)}
                          disabled={completing === a.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark as completed"
                        >
                          <CheckCircle size={14} />
                          {completing === a.id ? 'Updating...' : 'Complete'}
                        </button>
                      )}
                      {a.status === 'Completed' && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle size={14} /> Done
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => handleDelete(a.id, a.patient_name)}
                        disabled={deleting === a.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete appointment"
                      >
                        <Trash2 size={14} />
                        {deleting === a.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
};

const BillingView = ({ bills, onUpdate }) => {
  const [markingPaid, setMarkingPaid] = useState(null);

  const handleMarkPaid = async (billId) => {
    setMarkingPaid(billId);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/billing/${billId}/mark-paid`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        alert('Bill marked as paid successfully!');
        onUpdate();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to mark bill as paid');
      }
    } catch (err) {
      alert('Error updating bill status');
    } finally {
      setMarkingPaid(null);
    }
  };

  return (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
      <div>
        <h2 className="font-bold text-lg text-slate-800">Financial Records</h2>
        <p className="text-sm text-slate-500">Transaction history</p>
      </div>
      <div className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
        <Lock size={12} /> Admin Only
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
          <tr><th className="p-5">Bill ID</th><th className="p-5">Patient</th><th className="p-5">Type</th><th className="p-5">Description</th><th className="p-5">Date</th><th className="p-5">Status</th><th className="p-5 text-right">Amount</th><th className="p-5">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bills && bills.length > 0 ? bills.map(b => (
            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-5 text-slate-500 font-mono">#{b.id}</td>
              <td className="p-5 font-medium text-slate-900">{b.patient}</td>
              <td className="p-5">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  b.type === 'Appointment Fee' ? 'bg-blue-100 text-blue-700' : 
                  b.type === 'Room Charge' ? 'bg-purple-100 text-purple-700' : 
                  b.type === 'Treatment' ? 'bg-teal-100 text-teal-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {b.type}
                </span>
              </td>
              <td className="p-5 text-slate-600 text-sm max-w-xs truncate" title={b.description}>{b.description || 'N/A'}</td>
              <td className="p-5 text-slate-600">{b.date}</td>
              <td className="p-5"><span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span></td>
              <td className="p-5 text-right font-bold text-slate-900">₹{b.amount}</td>
              <td className="p-5">
                {b.status === 'Pending' ? (
                  <button
                    onClick={() => handleMarkPaid(b.id)}
                    disabled={markingPaid === b.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={14} />
                    {markingPaid === b.id ? 'Processing...' : 'Mark Paid'}
                  </button>
                ) : (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> Paid
                  </span>
                )}
              </td>
            </tr>
          )) : (
            <tr><td colSpan="8" className="p-12 text-center text-slate-400">No billing records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

const PrescriptionManagement = ({ prescriptions, patients, doctors, appointments, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ appointmentId: '', patientId: '', doctorId: '', diagnosis: '', medicines: '', dosage: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  // Get appointments that don't have prescriptions yet (only completed appointments)
  const availableAppointments = appointments.filter(a => 
    a.status === 'Completed' && 
    !prescriptions.some(p => p.appointment_id === a.id)
  );

  // Handle appointment selection - auto-fill patient and doctor
  const handleAppointmentChange = (appointmentId) => {
    const appointment = appointments.find(a => a.id === parseInt(appointmentId));
    if (appointment) {
      setForm({
        ...form,
        appointmentId: appointmentId,
        patientId: appointment.patient_id.toString(),
        doctorId: appointment.doctor_id.toString()
      });
    } else {
      setForm({...form, appointmentId: '', patientId: '', doctorId: ''});
    }
  };

  const handleAdd = async () => {
    if (!form.appointmentId) {
      return alert('Please select an appointment');
    }
    if (!form.diagnosis || !form.medicines) {
      return alert('Please fill all required fields (Diagnosis and Medicines)');
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        alert('Prescription added successfully!');
        setShowForm(false);
        setForm({ appointmentId: '', patientId: '', doctorId: '', diagnosis: '', medicines: '', dosage: '', notes: '' });
        onUpdate();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add prescription');
      }
    } catch (err) {
      alert('Error adding prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="font-bold text-lg text-slate-800">Prescription Records</h2>
          <p className="text-sm text-slate-500">Manage patient prescriptions</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          disabled={availableAppointments.length === 0}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> Add Prescription
        </button>
      </div>

      {availableAppointments.length === 0 && (
        <div className="p-6 bg-yellow-50 border-b border-yellow-200">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> No completed appointments available without prescriptions. Complete an appointment first to add a prescription.
          </p>
        </div>
      )}

      {showForm && (
        <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select 
              className="p-3 border rounded-lg bg-white md:col-span-2" 
              value={form.appointmentId} 
              onChange={e => handleAppointmentChange(e.target.value)}
              required
            >
              <option value="">Select Appointment *</option>
              {availableAppointments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.patient_name} - {a.date} - Dr. {a.doctor_name} ({a.reason})
                </option>
              ))}
            </select>
            <input 
              type="text"
              placeholder="Patient (Auto-filled)" 
              className="p-3 border rounded-lg bg-gray-100" 
              value={form.patientId ? patients.find(p => p.id === parseInt(form.patientId))?.name || '' : ''} 
              disabled
            />
            <input 
              type="text"
              placeholder="Doctor (Auto-filled)" 
              className="p-3 border rounded-lg bg-gray-100" 
              value={form.doctorId ? doctors.find(d => d.id === parseInt(form.doctorId))?.name || '' : ''} 
              disabled
            />
            <input 
              placeholder="Diagnosis *" 
              className="p-3 border rounded-lg" 
              value={form.diagnosis} 
              onChange={e => setForm({...form, diagnosis: e.target.value})}
            />
            <input 
              placeholder="Medicines *" 
              className="p-3 border rounded-lg md:col-span-2" 
              value={form.medicines} 
              onChange={e => setForm({...form, medicines: e.target.value})}
            />
            <input 
              placeholder="Dosage (Optional)" 
              className="p-3 border rounded-lg" 
              value={form.dosage} 
              onChange={e => setForm({...form, dosage: e.target.value})}
            />
            <textarea 
              placeholder="Notes (Optional)" 
              className="p-3 border rounded-lg resize-none" 
              rows="2"
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})}
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAdd} 
              disabled={submitting} 
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Prescription"}
            </button>
            <button 
              onClick={() => setShowForm(false)} 
              className="text-slate-600 px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
            <tr>
              <th className="p-5">Date</th>
              <th className="p-5">Appointment</th>
              <th className="p-5">Patient</th>
              <th className="p-5">Doctor</th>
              <th className="p-5">Diagnosis</th>
              <th className="p-5">Medicines</th>
              <th className="p-5">Dosage</th>
              <th className="p-5">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prescriptions.length === 0 ? (
              <tr><td colSpan="8" className="p-12 text-center text-slate-400">No prescriptions found.</td></tr>
            ) : (
              prescriptions.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 text-slate-600 flex items-center gap-2">
                    <Clock size={16}/> {p.date}
                  </td>
                  <td className="p-5">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      ID: {p.appointment_id}
                    </span>
                  </td>
                  <td className="p-5 font-medium text-slate-900">{p.patient_name}</td>
                  <td className="p-5 text-slate-600">{p.doctor_name}</td>
                  <td className="p-5 text-slate-700 max-w-xs">{p.diagnosis}</td>
                  <td className="p-5 text-slate-700 max-w-xs">
                    <div className="flex items-center gap-1">
                      <Pill size={14} className="text-teal-600" />
                      {p.medicines}
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 text-sm">{p.dosage || 'N/A'}</td>
                  <td className="p-5 text-slate-600 text-sm max-w-xs truncate" title={p.notes}>{p.notes || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RoomManagement = ({ rooms, patients, onUpdate }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({ patientId: '', roomId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);

  const handleBookRoom = async () => {
    if (!form.patientId || !form.roomId) return alert('Please select both patient and room');
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/rooms/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: form.patientId, roomId: form.roomId })
      });
      
      if (res.ok) {
        alert('Room booked successfully!');
        setShowBookingForm(false);
        setForm({ patientId: '', roomId: '' });
        setSelectedRoom(null);
        onUpdate();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to book room');
      }
    } catch (err) {
      alert('Error booking room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (roomId) => {
    if (!confirm('Are you sure you want to checkout this room?')) return;
    
    setCheckingOut(roomId);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/rooms/${roomId}/checkout`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        alert('Checkout successful!');
        onUpdate();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to checkout');
      }
    } catch (err) {
      alert('Error during checkout');
    } finally {
      setCheckingOut(null);
    }
  };

  const availableRooms = rooms.filter(r => !r.is_occupied);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="font-bold text-lg text-slate-800">Room Management</h2>
          <p className="text-sm text-slate-500">Available: {availableRooms.length} / {rooms.length} rooms</p>
        </div>
        <button 
          onClick={() => setShowBookingForm(!showBookingForm)} 
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-all"
        >
          <Plus size={18} /> Book Room
        </button>
      </div>

      {showBookingForm && (
        <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select 
              className="p-3 border rounded-lg bg-white" 
              value={form.patientId} 
              onChange={e => setForm({...form, patientId: e.target.value})}
            >
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select 
              className="p-3 border rounded-lg bg-white" 
              value={form.roomId} 
              onChange={e => setForm({...form, roomId: e.target.value})}
            >
              <option value="">Select Room</option>
              {availableRooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} - {r.room_type} (₹{r.price_per_day}/day)
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleBookRoom} 
              disabled={submitting} 
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
            <button 
              onClick={() => setShowBookingForm(false)} 
              className="text-slate-600 px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
            <tr>
              <th className="p-5">Room Number</th>
              <th className="p-5">Type</th>
              <th className="p-5">Floor</th>
              <th className="p-5">Price/Day</th>
              <th className="p-5">Status</th>
              <th className="p-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.length === 0 ? (
              <tr><td colSpan="6" className="p-12 text-center text-slate-400">No rooms available.</td></tr>
            ) : (
              rooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-medium text-slate-900 flex items-center gap-2">
                    <Building2 size={16} className="text-teal-600" />
                    {room.room_number}
                  </td>
                  <td className="p-5 text-slate-600">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      room.room_type === 'ICU' ? 'bg-red-100 text-red-700' : 
                      room.room_type === 'Private' ? 'bg-purple-100 text-purple-700' : 
                      room.room_type === 'Emergency' ? 'bg-orange-100 text-orange-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {room.room_type}
                    </span>
                  </td>
                  <td className="p-5 text-slate-600">Floor {room.floor}</td>
                  <td className="p-5 font-medium text-slate-900">₹{room.price_per_day}</td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      room.is_occupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {room.is_occupied ? 'Occupied' : 'Available'}
                    </span>
                  </td>
                  <td className="p-5">
                    {room.is_occupied ? (
                      <button
                        onClick={() => handleCheckout(room.id)}
                        disabled={checkingOut === room.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={14} />
                        {checkingOut === room.id ? 'Checking out...' : 'Checkout'}
                      </button>
                    ) : (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Home size={14} /> Ready
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AuthScreen = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' or 'doctor' or null
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();

      if (res.ok) {
        if (data.role !== selectedRole) {
             setError(`Access Denied: You are not a ${selectedRole === 'admin' ? 'Administrator' : 'Doctor'}.`);
             return;
        }
        onLogin(data.role);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl animate-fade-in text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-teal-600 p-4 rounded-2xl shadow-lg shadow-teal-200">
              <Activity className="text-white" size={40} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome</h2>
          <p className="text-slate-500 mb-8">Select your role to continue</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedRole('admin')}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-teal-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              <Lock size={20} /> Login as Administrator
            </button>
            <button 
              onClick={() => setSelectedRole('doctor')}
              className="w-full py-4 bg-white border-2 border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-600 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Stethoscope size={20} /> Login as Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl animate-fade-in">
        <button 
          onClick={() => { setSelectedRole(null); setError(''); setUsername(''); setPassword(''); }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to role selection
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-1 capitalize">{selectedRole} Login</h2>
          <p className="text-slate-500">Enter credentials for {selectedRole} access.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                placeholder={`e.g. ${selectedRole === 'admin' ? 'admin' : 'dr_house'}`}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-teal-200 hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};