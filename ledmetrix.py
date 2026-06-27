import tkinter as tk
import serial
import time

# --- CONFIGURATION ---
COM_PORT = 'COM3'  # Change to your ESP32's COM port!
BAUD_RATE = 115200

try:
    esp32 = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
    time.sleep(2) # Give the ESP32 a moment to wake up
    print("Connected to Matrix!")
except Exception as e:
    print(f"Error opening serial port: {e}")
    exit()

class LEDMatrixApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Matrix Controller")
        
        # 5x5 grid to store the state (0 = OFF, 1 = ON)
        self.state = [[0 for _ in range(5)] for _ in range(5)]
        self.buttons = []

        # Build the visual grid
        for r in range(5):
            row_buttons = []
            for c in range(5):
                btn = tk.Button(root, width=4, height=2, bg="white",
                                command=lambda row=r, col=c: self.toggle_pixel(row, col))
                btn.grid(row=r, column=c, padx=2, pady=2)
                row_buttons.append(btn)
            self.buttons.append(row_buttons)
            
        # Add a Clear button
        clear_btn = tk.Button(root, text="CLEAR", bg="red", fg="white", command=self.clear_grid)
        clear_btn.grid(row=5, column=0, columnspan=5, sticky="we", pady=10)

    def toggle_pixel(self, r, c):
        # Flip the state
        self.state[r][c] = 1 if self.state[r][c] == 0 else 0
        
        # Update the button color
        color = "black" if self.state[r][c] == 1 else "white"
        self.buttons[r][c].config(bg=color)
        
        # Send the new data to the ESP32
        self.send_data()

    def clear_grid(self):
        for r in range(5):
            for c in range(5):
                self.state[r][c] = 0
                self.buttons[r][c].config(bg="white")
        self.send_data()

    def send_data(self):
        # Start marker so the ESP32 knows a new frame is arriving
        payload = bytearray([255]) 
        
        for r in range(5):
            row_byte = 0b11111111 # Default: all 5 columns OFF
            
            for c in range(5):
                if self.state[r][c] == 1:
                    # MIRROR FLIP MATH:
                    # Instead of shifting left-to-right (c+1), 
                    # we shift right-to-left (5-c) to match your physical wiring.
                    shift_amount = 5 - c 
                    row_byte &= ~(1 << shift_amount)
                    
            payload.append(row_byte)
            
        # Fire the 6 bytes over USB
        esp32.write(payload)

# Run the app
root = tk.Tk()
app = LEDMatrixApp(root)
root.mainloop()