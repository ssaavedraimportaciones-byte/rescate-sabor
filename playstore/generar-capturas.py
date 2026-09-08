#!/usr/bin/env python3
"""
Compone las capturas de la ficha de Play Store en estilo minimalista.

Toma las capturas crudas de la app y las monta sobre un fondo neutro claro,
con un titular corto arriba y la pantalla flotando con esquinas redondeadas y
una sombra suave. En formato vertical la captura se sangra por el borde
inferior (se sale del lienzo), que es como se ven las fichas cuidadas: da
sensación de continuidad en vez de dejar un hueco muerto abajo.

Uso: python3 playstore/generar-capturas.py <carpeta_de_capturas_crudas>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAW = sys.argv[1] if len(sys.argv) > 1 else 'raw'
OUT = 'playstore/screenshots'

BG      = (244, 246, 244)   # neutro claro con un punto de verde
TINTA   = (17, 24, 39)      # titular
SUAVE   = (107, 114, 128)   # subtítulo
ACENTO  = (27, 122, 48)     # verde de marca

FB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'


def rounded_mask(size, radius, solo_arriba=False):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    if solo_arriba:                       # las esquinas de abajo se pierden al sangrar
        d.rectangle([0, size[1] - radius, size[0], size[1]], fill=255)
    return m


def compose(src, titulo, sub, W, H, out, escala_texto=1.0):
    shot = Image.open(src).convert('RGB')
    apaisado = shot.width > shot.height

    c = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(c)

    ft = ImageFont.truetype(FB, int(58 * escala_texto))
    fs = ImageFont.truetype(FR, int(34 * escala_texto))

    y = int(H * (0.055 if apaisado else 0.045))
    for linea in titulo.split('|'):
        w = d.textlength(linea, font=ft)
        d.text(((W - w) / 2, y), linea, font=ft, fill=TINTA)
        y += int(70 * escala_texto)

    if sub:
        w = d.textlength(sub, font=fs)
        d.text(((W - w) / 2, y + int(6 * escala_texto)), sub, font=fs, fill=SUAVE)
        y += int(52 * escala_texto)

    # filete de acento
    aw = int(70 * escala_texto)
    d.rounded_rectangle([(W - aw) // 2, y + 14, (W + aw) // 2, y + 20], radius=3, fill=ACENTO)
    top = y + int(60 * escala_texto)

    margen = int(W * (0.07 if apaisado else 0.085))
    radio = int(W * (0.018 if apaisado else 0.035))

    if apaisado:
        # cabe entero: se ajusta dentro del área con margen
        disp_w, disp_h = W - 2 * margen, H - top - margen
        s = min(disp_w / shot.width, disp_h / shot.height)
        nw, nh = int(shot.width * s), int(shot.height * s)
        img = shot.resize((nw, nh), Image.LANCZOS)
        img.putalpha(rounded_mask((nw, nh), radio))
        x, yy = (W - nw) // 2, top + (disp_h - nh) // 2
    else:
        # vertical: llena el ancho y se sangra por abajo
        nw = W - 2 * margen
        s = nw / shot.width
        nh = int(shot.height * s)
        img = shot.resize((nw, nh), Image.LANCZOS)
        img.putalpha(rounded_mask((nw, nh), radio, solo_arriba=True))
        x, yy = margen, top
        if yy + nh > H:                    # recorta lo que se sale
            img = img.crop((0, 0, nw, H - yy))
            nh = H - yy

    # sombra suave
    sombra = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle(
        [x, yy + int(H * 0.012), x + nw, yy + nh + int(H * 0.012)],
        radius=radio, fill=(15, 42, 24, 58))
    sombra = sombra.filter(ImageFilter.GaussianBlur(int(W * 0.022)))
    c.paste(Image.alpha_composite(c.convert('RGBA'), sombra).convert('RGB'), (0, 0))

    c.paste(img, (x, yy), img)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    c.save(out, quality=95)
    print('  ->', out, f'{W}x{H}')


# titular, subtítulo, archivo crudo, nombre de salida
TELEFONO = [
    ('Bolsas sorpresa|a mitad de precio', 'De locales de tu barrio',        'ph_browse',  '01-bolsas'),
    ('Reserva en 30 segundos',            'Sin filas ni llamadas',          'ph_tickets', '02-reservas'),
    ('Tus reservas|en tiempo real',       'Confirma y entrega al instante', 'ph_seller',  '03-vendedor'),
    ('Recupera lo que|dabas por perdido', 'Ingresos y pérdida evitada',     'ph_stats',   '04-ganancias'),
    ('Menos desperdicio.|Más sabor.',     'Gratis para negocios y personas','ph_landing', '05-impacto'),
]
TABLET7 = [
    ('Bolsas sorpresa|a mitad de precio', 'De locales de tu barrio',        't7_browse',  '01-bolsas'),
    ('Reserva en 30 segundos',            'Sin filas ni llamadas',          't7_tickets', '02-reservas'),
    ('Tus reservas|en tiempo real',       'Confirma y entrega al instante', 't7_seller',  '03-vendedor'),
    ('Menos desperdicio.|Más sabor.',     'Gratis para negocios y personas','t7_landing', '04-impacto'),
]
TABLET10 = [
    ('Menos desperdicio. Más sabor.', 'Rescata comida de calidad a precio justo', 't10_landing', '01-impacto'),
    ('Bolsas sorpresa a mitad de precio', 'De locales de tu barrio',              't10_browse',  '02-bolsas'),
    ('Tus reservas en tiempo real',   'Confirma y entrega al instante',           't10_seller',  '03-vendedor'),
    ('Recupera lo que dabas por perdido', 'Ingresos y pérdida evitada',           't10_stats',   '04-ganancias'),
]
CHROME = [
    ('Menos desperdicio. Más sabor.', 'Rescata comida de calidad a precio justo', 'cb_landing', '01-impacto'),
    ('Bolsas sorpresa a mitad de precio', 'De locales de tu barrio',              'cb_browse',  '02-bolsas'),
    ('Tus reservas en tiempo real',   'Confirma y entrega al instante',           'cb_seller',  '03-vendedor'),
]

GRUPOS = [
    ('telefono',   TELEFONO, 1080, 1920, 1.00),
    ('tablet-7',   TABLET7,  1200, 1920, 1.05),
    ('tablet-10',  TABLET10, 1920, 1200, 1.15),
    ('chromebook', CHROME,   1920, 1080, 1.15),
]

for carpeta, items, W, H, esc in GRUPOS:
    print(carpeta)
    for titulo, sub, raw, name in items:
        compose(f'{RAW}/{raw}.png', titulo, sub, W, H,
                f'{OUT}/{carpeta}/{name}.png', esc)
