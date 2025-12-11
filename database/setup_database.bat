@echo off
REM Hospital Management System - Database Setup Script (Windows)
REM This script sets up the PostgreSQL database for the hospital management system

echo 🏥 Hospital Management System - Database Setup
echo ==============================================
echo.

REM Database configuration
set DB_NAME=hospital_db
set DB_USER=postgres
set DB_PASSWORD=admin123

echo 📋 Configuration:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Password: %DB_PASSWORD%
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL is not found in PATH!
    echo Please install PostgreSQL and add it to your PATH
    echo Typical location: C:\Program Files\PostgreSQL\[version]\bin
    pause
    exit /b 1
)

echo ✅ PostgreSQL found
echo.

REM Step 1: Set password for postgres user
echo 🔧 Step 1: Setting password for postgres user...
set PGPASSWORD=%DB_PASSWORD%
psql -U %DB_USER% -c "ALTER USER postgres WITH PASSWORD '%DB_PASSWORD%';" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Password set successfully
) else (
    echo ⚠️  Warning: Could not set password or already set
)
echo.

REM Step 2: Create database
echo 🔧 Step 2: Creating database '%DB_NAME%'...
psql -U %DB_USER% -lqt | findstr /C:"%DB_NAME%" >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Database '%DB_NAME%' already exists
    set /p RECREATE="Do you want to drop and recreate it? (y/N): "
    if /i "%RECREATE%"=="y" (
        psql -U %DB_USER% -c "DROP DATABASE %DB_NAME%;" 2>nul
        echo 🗑️  Dropped existing database
        psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"
        echo ✅ Created new database
    ) else (
        echo ℹ️  Keeping existing database
    )
) else (
    psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"
    echo ✅ Database created successfully
)
echo.

REM Step 3: Import schema
echo 🔧 Step 3: Importing database schema...
set SCHEMA_FILE=%~dp0hospital_schema.sql

if not exist "%SCHEMA_FILE%" (
    echo ❌ Schema file not found: %SCHEMA_FILE%
    pause
    exit /b 1
)

psql -U %DB_USER% -d %DB_NAME% -f "%SCHEMA_FILE%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Schema imported successfully
) else (
    echo ⚠️  There were some warnings during schema import
    echo     Run manually to see details:
    echo     psql -U %DB_USER% -d %DB_NAME% -f "%SCHEMA_FILE%"
)
echo.

REM Step 4: Test connection
echo 🔧 Step 4: Testing connection...
psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) FROM users;" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Connection test successful!
) else (
    echo ⚠️  Connection test failed
    echo     Check pg_hba.conf in your PostgreSQL data directory
    echo     Typical location: C:\Program Files\PostgreSQL\[version]\data\pg_hba.conf
    echo     Ensure it allows password authentication for localhost
)
echo.

echo 🎉 Database setup complete!
echo.
echo 📝 Next steps:
echo   1. Update backend\app.py if needed with your database credentials
echo   2. Start the Flask backend: cd backend ^&^& python app.py
echo   3. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo 🔑 Default login credentials:
echo   Username: admin
echo   Password: admin123
echo.

pause
