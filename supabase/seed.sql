insert into public.tags (name, description)
values
  ('embedded', 'Embedded systems and microcontroller topics'),
  ('rtos', 'Real-time operating systems and scheduling'),
  ('pcb', 'PCB design, layout, and fabrication'),
  ('fpga', 'FPGA architecture and HDL workflows'),
  ('debugging', 'Firmware and hardware debugging techniques'),
  ('power', 'Power design and battery optimization'),
  ('sensors', 'Sensor interfaces, calibration, and filtering'),
  ('bootloader', 'Boot process, OTA, and recovery strategies')
on conflict (name)
do update set description = excluded.description;
