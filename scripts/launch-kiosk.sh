#!/bin/bash

# KetoOS Kiosk Mode Launcher
# Launches KetoOS in full-screen kiosk mode using Chromium browser


# Launch Chromium in kiosk mode with proper flags for Raspberry Pi
chromium-browser --noerrdialogs --disable-infobars --disable-pinch --overscroll-history-navigation=0 --kiosk https://os.ryo.lu