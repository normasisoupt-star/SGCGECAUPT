@echo off
title Sistema SGC UPT - Servidor Local
echo ===================================================
echo   UNIVERSIDAD PRIVADA DE TACNA - SISTEMA SGC
echo ===================================================
echo Iniciando servidor en http://127.0.0.1:5173/ ...
cd /d "C:\Users\GECA\.gemini\antigravity\scratch\iso21001-office-system"
npm.cmd run dev -- --host 127.0.0.1 --port 5173
pause
