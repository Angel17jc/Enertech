insert into public.devices_catalog (name, category, avg_kw, min_kw, max_kw, typical_hours_per_day, description)
values
  ('Refrigeradora estándar', 'refrigeracion', 0.350, 0.250, 0.500, 24.0, 'Modelo clase A+ común en Ecuador'),
  ('Refrigeradora eficiente', 'refrigeracion', 0.150, 0.100, 0.250, 24.0, 'Tecnología inverter, clase A++'),
  ('Aire acondicionado 12k BTU', 'climatizacion', 1.200, 0.900, 1.500, 8.0, 'Split inverter para salas medianas'),
  ('Aire acondicionado portátil', 'climatizacion', 1.400, 1.000, 1.800, 6.0, 'Modelos portátiles 110V'),
  ('Lavadora eficiente', 'lavanderia', 0.700, 0.500, 0.900, 1.0, 'Carga frontal, agua fría'),
  ('Lavadora tradicional', 'lavanderia', 1.100, 0.900, 1.400, 1.0, 'Carga superior, agua caliente'),
  ('Secadora eléctrica', 'lavanderia', 2.200, 1.800, 2.800, 1.0, 'Tambor mediano'),
  ('Televisor LED 50\"', 'entretenimiento', 0.120, 0.090, 0.180, 5.0, 'Uso moderado por día'),
  ('Computadora portátil', 'computo', 0.080, 0.050, 0.120, 8.0, 'Laptop uso hogar'),
  ('Computadora de escritorio', 'computo', 0.250, 0.180, 0.350, 6.0, 'CPU + monitor LCD'),
  ('Microondas 1200W', 'cocina', 1.200, 1.000, 1.400, 0.5, 'Uso intermitente'),
  ('Horno eléctrico mediano', 'cocina', 1.800, 1.500, 2.200, 1.0, 'Capacidad 40L'),
  ('Plancha de ropa', 'hogar', 1.200, 1.000, 1.500, 0.5, 'Uso eventual'),
  ('Secadora de cabello', 'hogar', 1.500, 1.200, 1.800, 0.3, '15 minutos diarios'),
  ('Iluminación LED 10 focos', 'iluminacion', 0.100, 0.070, 0.130, 6.0, 'Promedio por circuito'),
  ('Bomba de agua 1HP', 'servicios', 0.750, 0.600, 0.950, 1.5, 'Para cisterna doméstica'),
  ('Router + módem', 'servicios', 0.020, 0.015, 0.030, 24.0, 'Conectividad hogar'),
  ('Congelador horizontal', 'refrigeracion', 0.450, 0.300, 0.600, 24.0, 'Capacidad 300L'),
  ('Ventilador de pedestal', 'climatizacion', 0.075, 0.050, 0.100, 8.0, 'Motor 16 pulgadas'),
  ('Cargador de vehículo eléctrico Nivel 2', 'movilidad', 3.300, 2.200, 7.400, 2.0, 'Carga residencial 220V')
on conflict do nothing;
