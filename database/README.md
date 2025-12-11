# Hospital Management System - Database Setup Guide

## Quick Setup (Automated)

Run the setup script:

```bash
cd database
./setup_database.sh
```

This script will:
1. Set the postgres user password to `admin123`
2. Create the `hospital_db` database
3. Import the schema and sample data
4. Configure authentication

---

## Manual Setup

If the automated script doesn't work, follow these manual steps:

### Step 1: Start PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Step 2: Set Postgres User Password

```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:

```sql
ALTER USER postgres WITH PASSWORD 'admin123';
\q
```

### Step 3: Create Database

```bash
sudo -u postgres createdb hospital_db
```

### Step 4: Import Schema

```bash
sudo -u postgres psql -d hospital_db -f hospital_schema.sql
```

### Step 5: Configure Authentication

Edit the PostgreSQL authentication file:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Find lines that look like:

```
local   all             postgres                                peer
host    all             all             127.0.0.1/32            ident
```

Change them to use password authentication:

```
local   all             postgres                                md5
host    all             all             127.0.0.1/32            md5
```

Save and restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### Step 6: Test Connection

```bash
psql -U postgres -d hospital_db -h localhost
```

Enter password: `admin123`

---

## Troubleshooting

### Error: "password authentication failed for user postgres"

**Solution 1:** Set the password correctly

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'admin123';"
```

**Solution 2:** Update pg_hba.conf to use md5/scram-sha-256 authentication instead of peer/ident

**Solution 3:** Update the password in `backend/app.py` to match your actual postgres password:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:YOUR_PASSWORD@localhost/hospital_db'
```

### Error: "database does not exist"

Create the database:

```bash
sudo -u postgres createdb hospital_db
```

### Error: "role does not exist"

The postgres user doesn't exist. Install PostgreSQL properly or create the user:

```bash
sudo -u postgres createuser -s postgres
```

---

## Database Configuration

- **Database Name:** `hospital_db`
- **User:** `postgres`
- **Password:** `admin123` (change in production!)
- **Host:** `localhost`
- **Port:** `5432`

## Default Login Credentials

After setup, you can login to the application with:

- **Username:** `admin`
- **Password:** `admin123`

## Database Schema

The database includes the following tables:

- `Departments` - Hospital departments
- `Users` - User authentication
- `Doctors` - Doctor information
- `Patients` - Patient records
- `Rooms` - Hospital rooms
- `Appointments` - Patient appointments
- `Medical_Records` - Patient medical history
- `Billing` - Billing information
- `Admissions` - Patient admissions

## Sample Data

The schema includes sample data for:
- 4 Departments
- 3 Users (1 admin, 2 doctors)
- 2 Doctors
- 3 Patients
- 3 Rooms
- 3 Appointments

---

## Security Notes

⚠️ **Important for Production:**

1. **Change default passwords** - Don't use `admin123` in production!
2. **Use environment variables** for database credentials
3. **Hash passwords properly** - The current schema stores passwords in plain text (for demo only)
4. **Configure SSL** for database connections
5. **Restrict network access** to the database
6. **Regular backups** of the database

---

## Additional Commands

### View all databases:
```bash
psql -U postgres -h localhost -l
```

### Connect to hospital_db:
```bash
psql -U postgres -h localhost -d hospital_db
```

### View all tables:
```sql
\dt
```

### View table structure:
```sql
\d table_name
```

### Backup database:
```bash
pg_dump -U postgres -h localhost hospital_db > backup.sql
```

### Restore database:
```bash
psql -U postgres -h localhost hospital_db < backup.sql
```
