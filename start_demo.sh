#!/usr/bin/env zsh

echo "==========================="
echo " Starting Demo..."
echo "==========================="

# 1) Start the Backend
echo "Entering backend/..."
cd backend

echo "Starting the backend in the background..."
python app.py &

# 2) Start the Frontend
echo "Entering frontend/..."
cd ../frontend

echo "Starting the frontend..."
npm start