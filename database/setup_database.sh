#!/bin/bash

# Hospital Management System - Database Setup Script
# This script sets up the PostgreSQL database for the hospital management system

echo "🏥 Hospital Management System - Database Setup"
echo "=============================================="
echo ""

# Database configuration
DB_NAME="hospital_db"
DB_USER="postgres"
DB_PASSWORD="admin123"

echo "📋 Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running!"
    echo "Please start PostgreSQL service first:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Function to run SQL as postgres user
run_as_postgres() {
    sudo -u postgres psql -c "$1" 2>&1
}

# Step 1: Set password for postgres user
echo "🔧 Step 1: Setting password for postgres user..."
if run_as_postgres "ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';" | grep -q "ALTER ROLE"; then
    echo "✅ Password set successfully"
else
    echo "⚠️  Warning: Could not set password (might already be set)"
fi
echo ""

# Step 2: Create database
echo "🔧 Step 2: Creating database '$DB_NAME'..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_as_postgres "DROP DATABASE $DB_NAME;"
        echo "🗑️  Dropped existing database"
        run_as_postgres "CREATE DATABASE $DB_NAME;"
        echo "✅ Created new database"
    else
        echo "ℹ️  Keeping existing database"
    fi
else
    run_as_postgres "CREATE DATABASE $DB_NAME;"
    echo "✅ Database created successfully"
fi
echo ""

# Step 3: Import schema
echo "🔧 Step 3: Importing database schema..."
SCHEMA_FILE="$(dirname "$0")/hospital_schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Schema file not found: $SCHEMA_FILE"
    exit 1
fi

if sudo -u postgres psql -d "$DB_NAME" -f "$SCHEMA_FILE" > /dev/null 2>&1; then
    echo "✅ Schema imported successfully"
else
    echo "⚠️  There were some warnings during schema import (this might be normal)"
    echo "    Run manually to see details:"
    echo "    sudo -u postgres psql -d $DB_NAME -f $SCHEMA_FILE"
fi
echo ""

# Step 4: Configure authentication
echo "🔧 Step 4: Configuring PostgreSQL authentication..."
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version;" | cut -d'.' -f1 | xargs)
PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if [ -f "$PG_HBA_FILE" ]; then
    echo "ℹ️  PostgreSQL authentication file: $PG_HBA_FILE"
    echo "    Make sure it allows password authentication for localhost"
    echo "    You may need to change 'peer' or 'ident' to 'md5' or 'scram-sha-256'"
    echo "    Then restart PostgreSQL: sudo systemctl restart postgresql"
else
    echo "⚠️  Could not find pg_hba.conf automatically"
fi
echo ""

# Step 5: Test connection
echo "🔧 Step 5: Testing connection..."
if PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
    echo "✅ Connection test successful!"
else
    echo "⚠️  Connection test failed"
    echo "    This might be due to authentication configuration"
    echo "    Try connecting manually:"
    echo "    psql -U $DB_USER -d $DB_NAME"
fi
echo ""

echo "🎉 Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Update backend/app.py if needed with your database credentials"
echo "  2. Start the Flask backend: cd backend && python3 app.py"
echo "  3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🔑 Default login credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
