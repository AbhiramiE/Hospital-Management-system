# Windows Setup Instructions

## Prerequisites
- PostgreSQL installed on Windows
- PostgreSQL bin directory added to PATH (e.g., `C:\Program Files\PostgreSQL\16\bin`)

## Setup Steps

### 1. Open Command Prompt or PowerShell as Administrator

### 2. Set the postgres password
```cmd
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'admin123';"
```

### 3. Create the database
```cmd
psql -U postgres -c "CREATE DATABASE hospital_db;"
```

### 4. Import the schema
```cmd
cd database
psql -U postgres -d hospital_db -f hospital_schema.sql
```

### 5. Test the connection
```cmd
set PGPASSWORD=admin123
psql -U postgres -d hospital_db -c "SELECT COUNT(*) FROM users;"
```

### 6. Configure PostgreSQL Authentication (if needed)

Edit `pg_hba.conf` (typically at `C:\Program Files\PostgreSQL\[version]\data\pg_hba.conf`):

Find the line:
```
host    all             all             127.0.0.1/32            scram-sha-256
```

Make sure it says `scram-sha-256` or `md5` (not `trust` or `peer`).

Then restart PostgreSQL service:
- Open Services (services.msc)
- Find "postgresql-x64-[version]"
- Right-click → Restart

### 7. Update backend configuration

Edit `backend\app.py` line 11 to ensure it matches:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:admin123@localhost/hospital_db'
```

### 8. Run the application

**Backend:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```cmd
cd frontend
npm install
npm run dev
```

## Troubleshooting

**Error: psql is not recognized**
- Add PostgreSQL bin to PATH: `C:\Program Files\PostgreSQL\[version]\bin`

**Error: password authentication failed**
- Check pg_hba.conf allows password authentication
- Restart PostgreSQL service after changes

**Error: peer authentication failed**
- On Windows, use `127.0.0.1` instead of `localhost` in connection string
