(function () {
    'use strict';

    const CAMPOS_POR_TIPO = {
        CPU:            ['socket_compatible', 'tipo_ram_compatible', 'watts_recomendados'],
        PLACA:          ['socket_compatible', 'tipo_ram_compatible', 'form_factor', 'watts_recomendados'],
        RAM:            ['tipo_ram_compatible'],
        ALMACENAMIENTO: [],
        GPU:            ['watts_recomendados'],
        FUENTE:         ['watts_recomendados'],
        CASE:           ['form_factor'],
    };

    const TODOS_LOS_CAMPOS = ['socket_compatible', 'tipo_ram_compatible', 'watts_recomendados', 'form_factor'];

    function actualizarCampos(tipoSelect) {
        const tipo = tipoSelect.value;
        const visibles = CAMPOS_POR_TIPO[tipo] || [];
        // Scope al inline container o al documento completo (form standalone)
        const contenedor = tipoSelect.closest('.inline-related') || document;

        TODOS_LOS_CAMPOS.forEach(function (campo) {
            const row = contenedor.querySelector('.field-' + campo);
            if (row) {
                row.style.display = visibles.includes(campo) ? '' : 'none';
            }
        });
    }

    function inicializar(tipoSelect) {
        actualizarCampos(tipoSelect);
        tipoSelect.addEventListener('change', function () {
            actualizarCampos(this);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Form standalone de ComponentePC
        const standalone = document.getElementById('id_tipo');
        if (standalone) inicializar(standalone);

        // Inlines ya presentes en el DOM (e.g. ComponentePC existente en ProductoAdmin)
        document.querySelectorAll('[id$="-tipo"]').forEach(function (select) {
            if (select.id !== 'id_tipo') inicializar(select);
        });
    });

    // Inline añadido dinámicamente (botón "Agregar otro")
    document.addEventListener('formset:added', function (event) {
        const tipoSelect = event.target.querySelector('[id$="-tipo"]');
        if (tipoSelect) inicializar(tipoSelect);
    });
})();
