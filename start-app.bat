@echo off
echo Starting Ride Mitron Backend Server...
start cmd /k "cd backend && npm run dev"

echo Starting Ride Mitron Frontend React App...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting in new windows.
echo Make sure you have added your MongoDB URL in the backend/.env file!
exit
