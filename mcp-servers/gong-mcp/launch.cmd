@echo off
setlocal EnableDelayedExpansion

REM Gong MCP Server - Node.js Launcher
REM Finds Node.js in PATH or common installation locations

set "SCRIPT_DIR=%~dp0"
set "ENTRY_POINT=%SCRIPT_DIR%dist\index.js"

REM Try PATH first
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    node "%ENTRY_POINT%" %*
    exit /b %ERRORLEVEL%
)

REM Standard installation: Program Files
if exist "C:\Program Files\nodejs\node.exe" (
    "C:\Program Files\nodejs\node.exe" "%ENTRY_POINT%" %*
    exit /b %ERRORLEVEL%
)

REM User installation: Local AppData
if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
    "%LOCALAPPDATA%\Programs\node\node.exe" "%ENTRY_POINT%" %*
    exit /b %ERRORLEVEL%
)

REM Chocolatey installation
if exist "C:\ProgramData\chocolatey\lib\nodejs\tools\node.exe" (
    "C:\ProgramData\chocolatey\lib\nodejs\tools\node.exe" "%ENTRY_POINT%" %*
    exit /b %ERRORLEVEL%
)

REM nvm-windows
if exist "%APPDATA%\nvm" (
    for /d %%i in ("%APPDATA%\nvm\v*") do (
        if exist "%%i\node.exe" (
            "%%i\node.exe" "%ENTRY_POINT%" %*
            exit /b %ERRORLEVEL%
        )
    )
)

REM fnm (Fast Node Manager)
if exist "%LOCALAPPDATA%\fnm_multishells" (
    for /d %%i in ("%LOCALAPPDATA%\fnm_multishells\*") do (
        if exist "%%i\node.exe" (
            "%%i\node.exe" "%ENTRY_POINT%" %*
            exit /b %ERRORLEVEL%
        )
    )
)

REM Scoop
if exist "%USERPROFILE%\scoop\apps\nodejs\current\node.exe" (
    "%USERPROFILE%\scoop\apps\nodejs\current\node.exe" "%ENTRY_POINT%" %*
    exit /b %ERRORLEVEL%
)

echo ERROR: Node.js not found >&2
echo Install from https://nodejs.org >&2
exit /b 1
