import tkinter as tk
from tkinter import messagebox
import serial
import serial.tools.list_ports

class LEDControllerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("9 LED Controller (Shift Registers)")
        self.root.geometry("450x350")
        
        self.serial_port = None
        self.led_states = [0] * 9
        self.buttons = []
        
        # Map UI LED index (0 to 8) to hardware LED index (8 to 0)
        # Fixes reversed mapping where pressing LED 1 turned on LED 9, LED 2 turned on LED 8, etc.
        self.led_mapping = [8, 7, 6, 5, 4, 3, 2, 1, 0]
        
        self.setup_ui()

    def setup_ui(self):
        # Connection Frame
        conn_frame = tk.Frame(self.root)
        conn_frame.pack(pady=15)
        
        tk.Label(conn_frame, text="COM Port:", font=("Arial", 10, "bold")).pack(side=tk.LEFT)
        
        self.port_var = tk.StringVar()
        ports = self.get_ports()
        self.port_var.set(ports[0] if ports else "")
        
        self.port_dropdown = tk.OptionMenu(conn_frame, self.port_var, *(ports if ports else ["No ports found"]))
        self.port_dropdown.pack(side=tk.LEFT, padx=10)
        
        self.refresh_btn = tk.Button(conn_frame, text="Refresh", command=self.refresh_ports)
        self.refresh_btn.pack(side=tk.LEFT, padx=5)

        self.connect_btn = tk.Button(conn_frame, text="Connect", command=self.toggle_connection, bg="lightblue")
        self.connect_btn.pack(side=tk.LEFT, padx=5)
        
        # LED Grid Frame
        led_frame = tk.Frame(self.root)
        led_frame.pack(pady=20)
        
        # Create a 3x3 grid for the 9 LEDs
        for i in range(9):
            btn = tk.Button(led_frame, text=f"LED {i+1}\nOFF", bg="gray", fg="white", font=("Arial", 10, "bold"),
                            width=10, height=3, command=lambda idx=i: self.toggle_led(idx))
            btn.grid(row=i//3, column=i%3, padx=10, pady=10)
            self.buttons.append(btn)

    def get_ports(self):
        ports = [port.device for port in serial.tools.list_ports.comports()]
        return ports

    def refresh_ports(self):
        ports = self.get_ports()
        if not ports:
            ports = ["No ports found"]
        
        menu = self.port_dropdown["menu"]
        menu.delete(0, "end")
        for port in ports:
            menu.add_command(label=port, command=lambda p=port: self.port_var.set(p))
            
        if ports:
            self.port_var.set(ports[0])

    def toggle_connection(self):
        if self.serial_port and self.serial_port.is_open:
            self.serial_port.close()
            self.connect_btn.config(text="Connect", bg="lightblue")
            self.port_dropdown.config(state="normal")
            self.refresh_btn.config(state="normal")
            
            # Reset UI state visually when disconnected
            for i, btn in enumerate(self.buttons):
                self.led_states[i] = 0
                btn.config(text=f"LED {i+1}\nOFF", bg="gray")
        else:
            port = self.port_var.get()
            if port and port != "No ports found":
                try:
                    self.serial_port = serial.Serial(port, 115200, timeout=1)
                    self.connect_btn.config(text="Disconnect", bg="salmon")
                    self.port_dropdown.config(state="disabled")
                    self.refresh_btn.config(state="disabled")
                    
                    # Optional: send initial state to make sure all are off
                    for i in range(9):
                        self.send_command(i, 0)
                except Exception as e:
                    messagebox.showerror("Error", f"Could not connect to {port}:\n{e}")

    def toggle_led(self, idx):
        if not (self.serial_port and self.serial_port.is_open):
            messagebox.showwarning("Warning", "Please connect to a COM port first.")
            return
            
        # Toggle logical state
        new_state = 1 if self.led_states[idx] == 0 else 0
        self.led_states[idx] = new_state
        
        # Update UI visually
        if new_state == 1:
            self.buttons[idx].config(text=f"LED {idx+1}\nON", bg="limegreen")
        else:
            self.buttons[idx].config(text=f"LED {idx+1}\nOFF", bg="gray")
            
        # Send command over serial
        self.send_command(idx, new_state)

    def send_command(self, idx, state):
        # Map logical UI index (0-8) to hardware LED index (8-0)
        hw_idx = self.led_mapping[idx] if hasattr(self, 'led_mapping') and 0 <= idx < len(self.led_mapping) else idx
        # Format command as L<index><state>\n (e.g., L01\n for LED 1 ON)
        command = f"L{hw_idx}{state}\n"
        if self.serial_port and self.serial_port.is_open:
            try:
                self.serial_port.write(command.encode('utf-8'))
            except serial.SerialException as e:
                messagebox.showerror("Serial Error", f"Failed to write to port.\nIs the device still connected?\n\nError: {e}")
                # Optional: Force disconnect UI if we lose connection
                self.serial_port.close()
                self.connect_btn.config(text="Connect", bg="lightblue")
                self.port_dropdown.config(state="normal")
                self.refresh_btn.config(state="normal")

if __name__ == "__main__":
    root = tk.Tk()
    app = LEDControllerApp(root)
    root.mainloop()
