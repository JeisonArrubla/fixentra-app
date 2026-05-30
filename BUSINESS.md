# Fixentra — Modelo de Negocio

## Visión General

Fixentra es un marketplace para servicios del hogar (reparaciones, instalaciones, mantenimiento y aseo) cuyo valor diferencial es la **estandarización y transparencia de precios**.

A diferencia de los modelos tradicionales donde el cliente solicita un servicio genérico y espera una cotización del técnico, Fixentra parte de un **catálogo estructurado de productos-servicio** con precios fijos, descripciones detalladas (incluye / no incluye) y reglas de precio configurables. Cada servicio tiene precio base visible, soporte para cantidad (precioBase × N), extras opcionales y notas informativas.

---

## Flujo de Contratación

1. **Explorar catálogo** — El cliente navega por categorías (plomería, electricidad, jardinería, aseo, etc.) y ve todos los productos-servicio disponibles con su precio base.
2. **Ver detalle** — Al seleccionar un servicio, ve información completa: qué incluye, qué no incluye, reglas de precio (extras opcionales), notas informativas y el precio total estimado.
3. **Ajustar y calcular** — El cliente ajusta la cantidad y selecciona extras opcionales. La plataforma calcula automáticamente el desglose completo:
   - Precio base × cantidad
   - Extras seleccionados
   - Subtotal
   - Tarifa de servicio (8%)
   - **Total final**
4. **Confirmar** — El cliente confirma el servicio con toda la transparencia del desglose.
5. **Asignar técnico** — El sistema asigna un técnico disponible según geolocalización, nivel de reputación y radio de cobertura. Los técnicos de mayor nivel tienen prioridad con menor tiempo de espera.
6. **Ejecutar** — Cliente y técnico se comunican vía chat en tiempo real dentro de la plataforma.
7. **Completar y calificar** — El técnico completa el servicio con detalle y fotos. El cliente califica la experiencia (1-5 estrellas).

---

## Diagnóstico y Servicios Derivados

Un servicio de **diagnóstico o revisión** puede generar servicios adicionales empaquetados. Ejemplo:

- Cliente solicita "Diagnóstico de lavadora" a precio fijo.
- El técnico realiza el diagnóstico e identifica la falla.
- La plataforma presenta al cliente los servicios de reparación disponibles para esa falla específica, cada uno con su precio fijo y transparente.
- El cliente elige qué servicios adicionales contratar, todo dentro de la plataforma.

Este modelo permite que de un servicio inicial de diagnóstico se deriven múltiples servicios de reparación o mantenimiento, manteniendo siempre la estructura de precios predefinidos y la transparencia.

---

## Modelo de Confianza y Garantía

Fixentra actúa como **puente de confianza** entre el cliente y el técnico:

- **Precio definido antes de iniciar** — Sin sorpresas ni cobros extra no autorizados.
- **Trabajos adicionales gestionados en plataforma** — Si se requiere algo no incluido en el servicio original, se gestiona como un nuevo servicio dentro de la plataforma, nunca fuera de ella.
- **Intervención** — La plataforma puede intervenir si algo sale mal: servicio no prestado, incumplimiento del técnico, ajustes, garantías.
- **Sistema de niveles** — Los técnicos tienen niveles (Madera, Bronce, Plata, Oro) basados en su calificación promedio. Esto incentiva la calidad y permite a los clientes identificar a los mejores profesionales.
- **Calificaciones** — Cada servicio completado es calificado por el cliente, construyendo reputación verificable.

---

## Propuesta de Valor

### Para el Cliente

- Precios justos y transparentes — sabe exactamente cuánto pagará antes de contratar.
- Servicio en menos de 24 horas.
- Un solo canal confiable para todas las necesidades del hogar.
- Respaldo de la plataforma como garante.

### Para el Técnico

- Flujo constante de trabajos calificados.
- Autonomía para aceptar o rechazar servicios según su disponibilidad y ubicación.
- Reputación basada en calidad del servicio y calificaciones.
- Incentivos por buen desempeño (mayor nivel → mayor prioridad en asignaciones).

### Para la Plataforma

- Modelo escalable basado en tarifa de servicio (~8%) sobre cada transacción.
- Datos estructurados sobre servicios, precios y demanda.
- Posibilidad de expansión a nuevas verticales y ciudades.

---

## Sistema de Niveles de Técnico

Los técnicos se clasifican en niveles según su calificación promedio:

| Nivel   | Calificación Mínima | Tiempo de Espera (asignación) |
|---------|---------------------|-------------------------------|
| Oro     | 4.2                 | 0 min                         |
| Plata   | 3.5                 | 10 min                        |
| Bronce  | 2.8                 | 30 min                        |
| Madera  | 1.0                 | 60 min                        |

Los parámetros son configurables por variable de entorno, permitiendo ajustar los umbrales sin cambiar código.

---

## Modelo de Ingresos

Fixentra genera ingresos a través de una **tarifa de servicio** del 8% aplicada sobre cada transacción concretada en la plataforma. Esta tarifa se calcula automáticamente en el desglose de precio que el cliente ve antes de confirmar el servicio.

---

## Expansión Futura

- **Catálogo dinámico** — Los administradores podrán crear y modificar productos-servicio, categorías y reglas de precio.
- **Servicios agrupados** — Empaquetamiento de múltiples servicios en una sola orden (ej: "Mantenimiento general del hogar").
- **Suscripciones** — Planes de mantenimiento recurrente para hogares.
- **Múltiples ciudades** — Expansión geográfica con técnicos locales en cada región.
