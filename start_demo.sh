#!/usr/bin/env zsh

echo "==========================="
echo " Starting Demo..."
echo "==========================="

# 1) Start (or install for) the Backend
echo "Entering backend/..."
cd backend

# Uncomment if you have a requirements.txt:
# echo "Installing backend dependencies..."
# pip install -r requirements.txt

echo "Starting the backend in the background..."
python app.py &

# 2) Start (or install for) the Frontend
echo "Entering frontend/..."
cd ../frontend

# echo "Installing frontend dependencies..."
# npm install

echo "Starting the frontend..."
npm start

# If your shell script should block here so the user sees logs,
# then this is enough. 
# If you want to do more after the app starts, 
# be aware npm start is typically a blocking process.