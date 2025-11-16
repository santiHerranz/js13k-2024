<!-- 24d27929-d93d-4225-aadd-1153e3839899 4c5a8cbb-52a4-4549-b658-03ee221dd68b -->
# Actualizar Parches de Seguridad del Proyecto

## Análisis de Vulnerabilidades

El proyecto tiene 46 vulnerabilidades detectadas (1 crítica, 28 altas, 10 moderadas, 7 bajas). Algunas requieren actualizaciones mayores, pero hay varias que pueden resolverse con parches compatibles.

## Estrategia de Actualización

1. **Aplicar `npm audit fix`**: Actualizará automáticamente las dependencias que tienen parches compatibles sin cambios mayores
2. **Actualizar dependencias directas con parches disponibles**:

- `vite`: 4.1.3 → 4.5.14 (múltiples vulnerabilidades de seguridad)
- `webpack`: 5.73.0 → 5.102.1 (vulnerabilidad crítica)
- `tmp`: 0.2.1 → 0.2.5 (vulnerabilidad baja)
- `clean-css`: 5.3.2 → 5.3.3 (parche menor)
- `html-webpack-plugin`: 5.5.0 → 5.6.4 (parches de seguridad)
- `eslint`: 8.34.0 → 8.57.1 (parches de seguridad)
- `@typescript-eslint/eslint-plugin`: 5.53.0 → 5.62.0 (parches de seguridad)
- `@typescript-eslint/parser`: 5.53.0 → 5.62.0 (parches de seguridad)
- `ts-loader`: 9.3.1 → 9.5.4 (parches de seguridad)
- `webpack-dev-server`: 4.9.2 → 4.15.2 (parches de seguridad)

3. **Nota sobre `ect-bin`**: Tiene vulnerabilidades pero el fix disponible requiere downgrade a 1.3.3 (cambio mayor). Se mantendrá la versión actual ya que solo aplicamos parches.

## Archivos a Modificar

- `package.json`: Actualizar versiones de dependencias con parches disponibles
- `package-lock.json`: Se regenerará automáticamente al ejecutar npm install

## Pasos de Implementación

1. Ejecutar `npm audit fix` para aplicar parches automáticos
2. Actualizar manualmente las versiones en `package.json` para dependencias directas con parches disponibles
3. Ejecutar `npm install` para instalar las nuevas versiones
4. Verificar que el proyecto sigue funcionando con `npm run build`
5. Ejecutar `npm audit` nuevamente para confirmar la reducción de vulnerabilidades

### To-dos

- [ ] Ejecutar npm audit fix para aplicar parches automáticos compatibles
- [ ] Actualizar versiones en package.json para dependencias directas con parches disponibles (vite, webpack, tmp, clean-css, html-webpack-plugin, eslint, @typescript-eslint/*, ts-loader, webpack-dev-server)
- [ ] Ejecutar npm install para instalar las nuevas versiones
- [ ] Verificar que el proyecto compila correctamente con npm run build
- [ ] Ejecutar npm audit para confirmar la reducción de vulnerabilidades