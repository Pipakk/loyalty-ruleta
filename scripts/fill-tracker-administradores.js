/**
 * Rellena tracker_administradores.xlsx con los datos de contacto de administradores.
 * Ejecutar: node scripts/fill-tracker-administradores.js
 */

const XLSX = require('xlsx');
const path = require('path');

const administradores = [
  { nombre: "ANA ISABEL IGLESIAS BLÁZQUEZ", colegiado: "11722", direccion: "REFERENDUM DE VIÑAGRANDE 10 7º1", cp: "28925", poblacion: "ALCORCON", provincia: "MADRID", telefono: "0", movil: "", email: "", web: "" },
  { nombre: "MARCOS MARUGÁN MATEO", colegiado: "11702", direccion: "ALFREDO NOBEL 64º B", cp: "28922", poblacion: "ALCORCON", provincia: "MADRID", telefono: "0", movil: "", email: "", web: "" },
  { nombre: "MARCOS JESÚS BLÁZQUEZ BLANCO", colegiado: "11666", direccion: "Mayor 50", cp: "28921", poblacion: "ALCORCÓN", provincia: "MADRID", telefono: "918315502", movil: "", email: "", web: "" },
  { nombre: "RICARDO VILLAR CEREZO", colegiado: "11625", direccion: "CALLE ESPADA 36", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "0", movil: "", email: "", web: "" },
  { nombre: "SUSANA AGRA CASABELLA", colegiado: "11584", direccion: "PLAZA PRINCIPE DE ESPAÑA 1 3º B", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "661365351", movil: "", email: "", web: "" },
  { nombre: "MANUEL AMADO GUTIÉRREZ", colegiado: "11572", direccion: "PORTO COLÓN 10 PORTERIOR LOCAL 3", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "640569572", movil: "", email: "", web: "" },
  { nombre: "JUAN JOSÉ DEL TORO MOLINA", colegiado: "11478", direccion: "MATADERO 18 LOCAL 7", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "606146300", movil: "", email: "", web: "" },
  { nombre: "DAVID CANSECO ROMERO", colegiado: "11414", direccion: "AVD. OLIMPICO FCO. FDEZ. OCHOA 18 1º 3", cp: "28923", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916441583", movil: "", email: "", web: "" },
  { nombre: "CRISTINA HERNANSANZ MOLINA", colegiado: "11412", direccion: "PORTO CRISTO 9 BAJO B ESC CENTRO", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "663380237", movil: "", email: "", web: "" },
  { nombre: "RAÚL MANZANO ENDRINO", colegiado: "11229", direccion: "CÁCERES 23 LOCAL", cp: "28922", poblacion: "ALCORCON", provincia: "MADRID", telefono: "911760755", movil: "", email: "", web: "" },
  { nombre: "RAÚL SAEZ GARCÍA", colegiado: "11057", direccion: "Cl. Copenhague 21-23, Local 4 Bis", cp: "28922", poblacion: "ALCORCON", provincia: "MADRID", telefono: "630923706", movil: "", email: "", web: "" },
  { nombre: "EDUARDO PERERO VAN HOVE", colegiado: "11027", direccion: "AVD. DE LAS FLORES 71", cp: "28925", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916198557", movil: "", email: "", web: "" },
  { nombre: "ÁNGEL SÁNCHEZ VÁZQUEZ", colegiado: "10927", direccion: "PLAZA DEL PEÑON, 2", cp: "28923", poblacion: "ALCORCON", provincia: "MADRID", telefono: "917287118", movil: "", email: "", web: "" },
  { nombre: "MARGARITA RODRÍGUEZ JIMÉNEZ", colegiado: "10922", direccion: "MAYOR 14 1º A", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916438988", movil: "", email: "", web: "" },
  { nombre: "DANIEL GIL NEVADO", colegiado: "10739", direccion: "PORTO LAGOS 13 LOCAL 4 POSTERIOR R", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916190147", movil: "", email: "", web: "" },
  { nombre: "DAVID APEZARENA CANCELAS", colegiado: "10581", direccion: "Calle Estambul 22, Oficina.23. Ctro.Negocios P Oeste.", cp: "28922", poblacion: "ALCORCON", provincia: "MADRID", telefono: "910378790", movil: "", email: "", web: "http://www.lphfincas.es" },
  { nombre: "JOSE ANTONIO CARMONA MARTIN", colegiado: "10568", direccion: "AVD. LIBERTAD 7 5ºB", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916124824", movil: "607553061", email: "joseantonio@acmgest.es", web: "" },
  { nombre: "ALEJANDRO CUENA VILCHES", colegiado: "10542", direccion: "PLAZA DE LAS HERMANDADES 1 ESC 1 1º D", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916100922", movil: "", email: "", web: "" },
  { nombre: "JOSE LUIS LOPEZ PEREZ", colegiado: "10490", direccion: "RIOJA 2 3ª PLANTA", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916436293", movil: "", email: "", web: "" },
  { nombre: "MANUEL ENRIQUE CARRASCO OCAÑA", colegiado: "10440", direccion: "CABO SAN VICENTE 14 1º D CENTRO", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "0", movil: "", email: "", web: "" },
  { nombre: "SANDRA VALLEJO MUÑOZ", colegiado: "10438", direccion: "OLIMPIADA 5 LOCAL 6", cp: "28923", poblacion: "ALCORCON", provincia: "MADRID", telefono: "0", movil: "", email: "", web: "" },
  { nombre: "DANIEL RUIZ ESTEBAN", colegiado: "10366", direccion: "PORTO COLON 10 POSTERIOR LOCAL 3", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "915904646", movil: "", email: "", web: "" },
  { nombre: "FRANCISCO JAVIER GARCIA MONTORO", colegiado: "10217", direccion: "Plaza del Peñón, 8 Escalera Derecha 1ºD", cp: "28923", poblacion: "ALCORCON", provincia: "MADRID", telefono: "910531113", movil: "", email: "", web: "" },
  { nombre: "ALFONSO CRUZ GALLARDO", colegiado: "10143", direccion: "IGUAZÚ 3 PORTAL 9 LC", cp: "28922", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916448707", movil: "", email: "", web: "" },
  { nombre: "DANUTA DREWKO MACYK", colegiado: "10045", direccion: "PRINCESA DOÑA SOFIA 5 BIS LOCAL 1", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916110183", movil: "", email: "", web: "" },
  { nombre: "MERCEDES JIMENEZ RAMIREZ", colegiado: "9969", direccion: "C/ FUENTE CISNEROS 30 4º B", cp: "28922", poblacion: "ALCORCON", provincia: "MADRID", telefono: "914967326", movil: "", email: "", web: "" },
  { nombre: "OLGA CORTIJO FERNANDEZ", colegiado: "9902", direccion: "LAS FABRICAS 1 1º OFICINA 34", cp: "28923", poblacion: "ALCORCON", provincia: "MADRID", telefono: "918058015", movil: "", email: "", web: "" },
  { nombre: "MIRIAM TALAVERA VEGA", colegiado: "9898", direccion: "AVD. LOS CARABANCHELES 10", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916103611", movil: "", email: "", web: "" },
  { nombre: "INMACULADA DE CABO SANCHEZ", colegiado: "9848", direccion: "AVD. DE LEGANES 6 ESC-4ºA", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916123544", movil: "", email: "", web: "" },
  { nombre: "FERNANDO TEIJEIRO CIUDAD", colegiado: "9773", direccion: "AVENIDA CASTILLOS 15 LOCAL 1", cp: "28925", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916118195", movil: "", email: "", web: "" },
  { nombre: "MONTSERRAT PARAMIO PADROS", colegiado: "9709", direccion: "CISNEROS 23 LOCAL", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916439875", movil: "", email: "", web: "" },
  { nombre: "RAUL GRANADO GALLEGO", colegiado: "9406", direccion: "CALLE MAYOR 1 PORTAL 1 1ºB", cp: "28921", poblacion: "ALCORCON", provincia: "MADRID", telefono: "913857013", movil: "", email: "", web: "" },
  { nombre: "YOLANDA DE LA CRUZ GARCIA", colegiado: "9228", direccion: "CABO SAN VICENTE 16- 3ºC IZDA.- PARQUE DE LISBOA", cp: "28925", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916104907", movil: "", email: "", web: "" },
  { nombre: "JESUS GONZALEZ GARCIA", colegiado: "9185", direccion: "VIZCAYA 4-1º4", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916441621", movil: "", email: "", web: "" },
  { nombre: "MARIA TERESA GONZALEZ MARCOS", colegiado: "8883", direccion: "TORDESILLAS 4-2ºC", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916109451", movil: "", email: "", web: "" },
  { nombre: "BEATRIZ YAGUE GUILLEN", colegiado: "8687", direccion: "PORTO CRISTO 7-BAJO B IZD", cp: "28924", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916111235", movil: "", email: "", web: "" },
  { nombre: "ANGEL LUIS RODRIGUEZ APARICIO", colegiado: "8416", direccion: "PARQUE DEL TEIDE 5", cp: "28924", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916103499", movil: "", email: "", web: "" },
  { nombre: "JAVIER ARNAIZ GARCÍA", colegiado: "8401", direccion: "OCEANÍA 1 PORTAL 23 1º", cp: "28922", poblacion: "ALCORCON", provincia: "MADRID", telefono: "609766568", movil: "", email: "", web: "" },
  { nombre: "PABLO MARTINEZ DE RITUERTO MIGUEL", colegiado: "8347", direccion: "TORDESILLAS 10-3ºA", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "656931748", movil: "", email: "", web: "" },
  { nombre: "MARIA DOLORES VIZUETE GOMEZ", colegiado: "8294", direccion: "FUENLABRADA 17- 2ª PLANTA", cp: "28922", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916442122", movil: "", email: "", web: "" },
  { nombre: "EDUARDO SERRANO LOBO", colegiado: "8243", direccion: "SAN JOSE 9-LOC.3 POSTER.", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916198303", movil: "", email: "", web: "" },
  { nombre: "JAVIER MARCHANTE CASTAÑO", colegiado: "8218", direccion: "DOÑANA, 2 LOCAL 13", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "914860447", movil: "", email: "", web: "" },
  { nombre: "MARIA LUZ DIAZ GUTIERREZ", colegiado: "8127", direccion: "OLIMP.FDEZ.OCHOA 9-ESC.B", cp: "28923", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916443566", movil: "", email: "", web: "" },
  { nombre: "FCO. JAVIER IRIARTE GOMEZ", colegiado: "7961", direccion: "AVD M-40 5-7 BAJO A-001", cp: "28925", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916320460", movil: "", email: "", web: "" },
  { nombre: "JUAN GARCIA ESTEBAN", colegiado: "7846", direccion: "TORDESILLAS 4-2ºC", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916109451", movil: "", email: "", web: "" },
  { nombre: "JOSE LUIS GONZALEZ CARRASCO", colegiado: "7834", direccion: "RIOJA, 2 3ª PLANTA", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916436293", movil: "", email: "", web: "" },
  { nombre: "ANA PEREZ SANCHEZ", colegiado: "7712", direccion: "C/ JAPON 17 LOCAL ADAL", cp: "28923", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916196333", movil: "", email: "", web: "" },
  { nombre: "JOSE ANGEL MORENO-GALVACHE FRANCO", colegiado: "7308", direccion: "PARQUE BUJARUELO 25 LOCAL 3.1", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916210258", movil: "", email: "", web: "" },
  { nombre: "JOSE MARIA MARTINEZ BLANES", colegiado: "7251", direccion: "PARQUE BUJARUELO, 13 6ºB", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "915698085", movil: "", email: "", web: "" },
  { nombre: "JOSE YUSTE CASAÑEZ", colegiado: "6941", direccion: "PORTO ALEGRE 4-LOCAL 1", cp: "28924", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916196808", movil: "", email: "", web: "" },
  { nombre: "FCO. ANTONIO MUÑOZ DUQUE", colegiado: "6917", direccion: "ISLAS CIES 5-LOCAL", cp: "28924", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916119181", movil: "", email: "", web: "" },
  { nombre: "FRANCISCO TALAVERA MARTIN", colegiado: "6709", direccion: "AV CARABANCHELES 10", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916108957", movil: "", email: "", web: "" },
  { nombre: "JUAN PEDRO REBOLLEDO GARCIA", colegiado: "6675", direccion: "ESPADA 13-LOCAL IZQUIERDO", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "691131518", movil: "", email: "", web: "" },
  { nombre: "JUAN PEDRO ALVAREZ GUMIEL", colegiado: "6448", direccion: "AV M-40, 13- BAJO 32 PARQUE EMPRESARIAL V.CANO", cp: "28925", poblacion: "ALCORCON", provincia: "MADRID", telefono: "911234567", movil: "", email: "", web: "" },
  { nombre: "MARINA MARIA SANCHEZ JEAN", colegiado: "6096", direccion: "AV LEGANES 2 3º A", cp: "28925", poblacion: "ALCORCON", provincia: "MADRID", telefono: "916117285", movil: "", email: "", web: "" },
  { nombre: "JESUS DEL HOYO GUIJARRO", colegiado: "5828", direccion: "PORTO ALEGRE 4 LOCAL 1", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916196808", movil: "", email: "", web: "" },
  { nombre: "RICARDO RODRIGUEZ ROMERO", colegiado: "5824", direccion: "VENUS 3 LOCAL 2", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916199095", movil: "", email: "", web: "" },
  { nombre: "VALENTIN VALLEJO MARTIN", colegiado: "5688", direccion: "OLIMPIADA 5-LOCAL 6", cp: "28923", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916192357", movil: "", email: "", web: "" },
  { nombre: "ANA MARIA SERRANO LOBO", colegiado: "5622", direccion: "SAN JOSE 9 LOC.3-BIS POST", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916198303", movil: "", email: "", web: "" },
  { nombre: "FRANCISCO DOMINGUEZ ALVAREZ", colegiado: "4598", direccion: "MATADERO 18 BAJO 7", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916430852", movil: "", email: "", web: "" },
  { nombre: "JOSÉ MARÍA MANSO JIMÉNEZ", colegiado: "4579", direccion: "PUENTEDEUME 5 BAJO", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "677308308", movil: "", email: "", web: "" },
  { nombre: "ENRIQUE RODRIGUEZ TORRES", colegiado: "4206", direccion: "MAYOR 14-1ºA", cp: "28921", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916432240", movil: "", email: "", web: "" },
  { nombre: "ALFONSO YUSTE CASAÑEZ", colegiado: "3746", direccion: "PORTO ALEGRE 4 LOCAL 1-2", cp: "28925", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916196808", movil: "", email: "", web: "" },
  { nombre: "ANGEL GIL RODRIGUEZ", colegiado: "2736", direccion: "PORTO LAGOS 13-LOC.4-POST", cp: "28924", poblacion: "ALCORCON", provincia: "Madrid", telefono: "916190147", movil: "", email: "", web: "" },
];

const headers = ['Nombre', 'Nº Colegiado', 'Dirección', 'Código postal', 'Población', 'Provincia', 'Teléfono', 'Móvil', 'Email', 'Página web'];
const rows = administradores.map(a => [
  a.nombre,
  a.colegiado,
  a.direccion,
  a.cp,
  a.poblacion,
  a.provincia,
  a.telefono,
  a.movil,
  a.email,
  a.web,
]);

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
XLSX.utils.book_append_sheet(wb, ws, 'Administradores');

// Si el archivo en Downloads está abierto, se guarda en el proyecto
const downloadsPath = path.join(process.env.USERPROFILE || '', 'Downloads', 'tracker_administradores.xlsx');
const projectPath = path.join(__dirname, '..', 'docs', 'tracker_administradores.xlsx');
let outPath = downloadsPath;
try {
  XLSX.writeFile(wb, downloadsPath);
} catch (e) {
  if (e.code === 'EBUSY' || e.code === 'EPERM') {
    const fs = require('fs');
    fs.mkdirSync(path.dirname(projectPath), { recursive: true });
    XLSX.writeFile(wb, projectPath);
    outPath = projectPath;
    console.log('(Descargas bloqueado: archivo guardado en el proyecto)');
  } else throw e;
}
console.log('Excel generado:', outPath);
console.log('Total filas:', rows.length);
