export const cycleGroups=[
['Motores de combustión interna',[['otto','Otto','Gasolina: combustión a volumen constante'],['diesel','Diésel','Combustión a presión constante'],['dual','Dual','Combustión mixta']]],
['Turbinas de gas',[['brayton','Brayton ideal y con fricción','Incluye potencia máxima'],['brayton-reg','Brayton con regeneración'],['brayton-int','Brayton con interenfriador y recalentamiento'],['stirling','Stirling y Ericsson'],['reaccion','Propulsión por reacción']]],
['Ciclos de vapor',[['carnot-vapor','Carnot de vapor'],['rankine','Rankine ideal'],['rankine-reg','Rankine con regeneración'],['rankine-rec','Rankine con recalentamiento'],['combinado','Ciclo combinado']]],
['Refrigeración y bomba de calor',[['ref-vapor','Compresión de vapor'],['ref-gas','Compresión de gas'],['ref-abs','Vacío y absorción']]]
];
export const ready={otto:()=>import('../cycles/otto.js')};
