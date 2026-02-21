// ========================================
// SISTEMA DE EDIÇÃO COMPLETO - BRIBELLOS
// Torna TODO texto editável + Exporta versão estática
// ========================================

let editMode = false;
let originalContent = {};

// Inicializar sistema
document.addEventListener('DOMContentLoaded', () => {
    createEditButton();
    loadSavedContent();
});

// Criar botões de controle
function createEditButton() {
    const editBtn = document.createElement('button');
    editBtn.id = 'edit-mode-toggle';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Ativar Modo de Edição';
    editBtn.onclick = toggleEditMode;
    document.body.appendChild(editBtn);

    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-btn';
    exportBtn.innerHTML = '💾';
    exportBtn.title = 'Exportar Site Finalizado';
    exportBtn.onclick = exportStaticSite;
    exportBtn.style.display = 'none';
    document.body.appendChild(exportBtn);
}

// Alternar modo de edição
function toggleEditMode() {
    editMode = !editMode;
    const btn = document.getElementById('edit-mode-toggle');
    const exportBtn = document.getElementById('export-btn');
    
    if (editMode) {
        btn.innerHTML = '👁️';
        btn.title = 'Desativar Modo de Edição';
        btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        exportBtn.style.display = 'block';
        enableEditing();
        showEditPanel();
    } else {
        btn.innerHTML = '✏️';
        btn.title = 'Ativar Modo de Edição';
        btn.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
        exportBtn.style.display = 'none';
        disableEditing();
        hideEditPanel();
    }
}

// Ativar edição em TODOS os textos
function enableEditing() {
    const editableSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span:not(.line)', 'a', 'li',
        '.badge', '.section-title', '.section-badge',
        '.stat-number', '.stat-label',
        '.service-card h3', '.service-card > p',
        '.result-info h4', '.result-info p',
        '.testimonial-card h4', '.testimonial-card > p',
        '.faq-question h4', '.faq-answer p',
        '.footer-description', '.contact-item div',
        '.cta-content h3', '.cta-content p',
        '.hero > .container > p', '.value-content h4', '.value-content p',
        '.highlight-box p', '.highlight-box .author',
        '.problem-box li', '.solution-box li',
        '.service-benefits li', '.trust-item span',
        '.urgency-bar p', '.price', '.from',
        '.popular-badge', '.result-badge',
        '.verified', '.review-count', '.cta-subtitle',
        '.cta-benefit span', '.cta-urgency',
        '.brand-name', '.btn:not(.close-btn):not(.tab-btn):not(.action-btn)'
    ];

    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            if (element.closest('#edit-control-panel') ||
                element.closest('#edit-mode-toggle') ||
                element.closest('#export-btn')) {
                return;
            }

            const path = getElementPath(element);
            if (!originalContent[path]) {
                originalContent[path] = element.innerHTML;
            }

            element.contentEditable = true;
            element.classList.add('editable-active');
            
            element.addEventListener('blur', function() {
                saveElementContent(path, this.innerHTML);
            });

            element.style.outline = '2px dashed rgba(99, 102, 241, 0.3)';
            element.style.cursor = 'text';
            element.title = 'Clique para editar';
        });
    });

    showNotification('✏️ Modo de Edição ATIVADO! Clique em qualquer texto para editar.', 'info');
}

// Desativar edição
function disableEditing() {
    document.querySelectorAll('.editable-active').forEach(element => {
        element.contentEditable = false;
        element.classList.remove('editable-active');
        element.style.outline = 'none';
        element.style.cursor = 'default';
        element.title = '';
    });
    
    showNotification('👁️ Modo de Visualização ativado. Suas edições foram salvas!', 'success');
}

// Gerar caminho único para elemento
function getElementPath(element) {
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        
        if (current.id) {
            selector += `#${current.id}`;
            path.unshift(selector);
            break;
        }
        
        if (current.className) {
            const classes = current.className.split(' ')
                .filter(c => c && !c.includes('editable') && !c.includes('active') && !c.includes('show'));
            if (classes.length > 0) {
                selector += `.${classes[0]}`;
            }
        }
        
        const parent = current.parentNode;
        if (parent) {
            const siblings = Array.from(parent.children).filter(s => s.tagName === current.tagName);
            if (siblings.length > 1) {
                const index = siblings.indexOf(current);
                selector += `:nth-of-type(${index + 1})`;
            }
        }
        
        path.unshift(selector);
        current = parent;
    }
    
    return path.join(' > ');
}

// Salvar conteúdo de elemento
function saveElementContent(path, content) {
    const savedContent = JSON.parse(localStorage.getItem('bribellosEditedContent') || '{}');
    savedContent[path] = content;
    localStorage.setItem('bribellosEditedContent', JSON.stringify(savedContent));
    updateStats();
}

// Carregar conteúdo salvo
function loadSavedContent() {
    const savedContent = JSON.parse(localStorage.getItem('bribellosEditedContent') || '{}');
    
    Object.keys(savedContent).forEach(path => {
        try {
            const element = document.querySelector(path);
            if (element) {
                element.innerHTML = savedContent[path];
            }
        } catch (e) {
            console.warn('Não foi possível carregar elemento:', path);
        }
    });
    
    // Carregar WhatsApp
    const whatsappNumber = localStorage.getItem('bribellosWhatsAppNumber');
    if (whatsappNumber) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${whatsappNumber}`);
        });
    }
}

// Mostrar painel de controle
function showEditPanel() {
    if (document.getElementById('edit-control-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'edit-control-panel';
    panel.innerHTML = `
        <div class="control-header">
            <h3>🎨 Painel de Controle</h3>
            <button onclick="closeControlPanel()" class="close-btn">✕</button>
        </div>
        <div class="control-content">
            <div class="control-section">
                <h4>📝 Instruções</h4>
                <ul class="instructions-list">
                    <li>✅ Clique em qualquer texto para editar</li>
                    <li>✅ As mudanças salvam automaticamente ao sair do campo</li>
                    <li>✅ Edite preços, títulos, depoimentos, TUDO!</li>
                    <li>✅ Quando terminar, clique em "Exportar Site"</li>
                </ul>
            </div>
            
            <div class="control-section">
                <h4>🔧 Ações Rápidas</h4>
                <button onclick="previewChanges()" class="action-btn preview">
                    👁️ Ver Prévia (Desativar Edição)
                </button>
                <button onclick="resetAllContent()" class="action-btn reset">
                    🔄 Restaurar Original
                </button>
            </div>
            
            <div class="control-section">
                <h4>📱 Editar WhatsApp</h4>
                <label>Número (ex: 5541999999999):</label>
                <input type="text" id="whatsapp-number" placeholder="5541999999999" 
                       value="${extractWhatsAppNumber()}">
                <button onclick="updateWhatsAppNumber()" class="action-btn update">
                    Atualizar WhatsApp
                </button>
                <small>⚠️ Formato: 55 (BR) + 41 (DDD) + 999999999</small>
            </div>
            
            <div class="control-section">
                <h4>📊 Estatísticas</h4>
                <div class="stats-info">
                    <p><strong>Elementos editáveis:</strong> <span id="editable-count">0</span></p>
                    <p><strong>Elementos editados:</strong> <span id="edited-count">0</span></p>
                </div>
            </div>
        </div>
        <div class="control-footer">
            <button onclick="exportStaticSite()" class="export-final-btn">
                🚀 Exportar Site Finalizado (SEM Editor)
            </button>
            <small style="display:block; margin-top:10px; color:#666; text-align:center;">
                Gera 4 arquivos limpos para colocar online
            </small>
        </div>
    `;
    
    document.body.appendChild(panel);
    updateStats();
}

function closeControlPanel() {
    const panel = document.getElementById('edit-control-panel');
    if (panel) panel.remove();
}

function hideEditPanel() {
    closeControlPanel();
}

function previewChanges() {
    if (editMode) {
        toggleEditMode();
        showNotification('👁️ Prévia ativada. Clique no botão ✏️ para voltar a editar.', 'info');
    }
}

function resetAllContent() {
    if (!confirm('⚠️ ATENÇÃO: Isso vai apagar TODAS as suas edições e voltar ao conteúdo original. Tem certeza?')) {
        return;
    }
    
    localStorage.removeItem('bribellosEditedContent');
    localStorage.removeItem('bribellosWhatsAppNumber');
    showNotification('🔄 Conteúdo restaurado! A página será recarregada...', 'info');
    
    setTimeout(() => location.reload(), 1500);
}

function extractWhatsAppNumber() {
    const saved = localStorage.getItem('bribellosWhatsAppNumber');
    if (saved) return saved;
    
    const link = document.querySelector('a[href*="wa.me"]');
    if (link) {
        const match = link.href.match(/wa\.me\/(\d+)/);
        return match ? match[1] : '5541985386109';
    }
    return '5541985386109';
}

function updateWhatsAppNumber() {
    const newNumber = document.getElementById('whatsapp-number').value.trim();
    
    if (!/^\d{13}$/.test(newNumber)) {
        showNotification('❌ Número inválido! Use 13 dígitos: 5541999999999', 'error');
        return;
    }
    
    let count = 0;
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${newNumber}`);
        count++;
    });
    
    localStorage.setItem('bribellosWhatsAppNumber', newNumber);
    showNotification(`✅ ${count} links do WhatsApp atualizados para: ${newNumber}`, 'success');
}

function updateStats() {
    const editableCount = document.querySelectorAll('.editable-active').length;
    const savedContent = JSON.parse(localStorage.getItem('bribellosEditedContent') || '{}');
    const editedCount = Object.keys(savedContent).length;
    
    const editableCountEl = document.getElementById('editable-count');
    const editedCountEl = document.getElementById('edited-count');
    
    if (editableCountEl) editableCountEl.textContent = editableCount;
    if (editedCountEl) editedCountEl.textContent = editedCount;
}

// EXPORTAR SITE ESTÁTICO LIMPO
function exportStaticSite() {
    showNotification('⚙️ Gerando arquivos finalizados do site...', 'info');
    
    setTimeout(() => {
        const cleanHTML = generateCleanHTML();
        const cleanCSS = generateCleanCSS();
        const cleanJS = generateCleanJS();
        const readme = generateReadme();
        
        downloadFile('index.html', cleanHTML);
        downloadFile('style.css', cleanCSS);
        downloadFile('script.js', cleanJS);
        downloadFile('LEIA-ME.txt', readme);
        
        showNotification('✅ 4 arquivos baixados! Use todos juntos na mesma pasta.', 'success');
    }, 500);
}

function generateCleanHTML() {
    const clone = document.documentElement.cloneNode(true);
    
    // Remover scripts e CSS do editor
    clone.querySelectorAll('script[src*="content-editor"], script[src*="editor"]').forEach(el => el.remove());
    clone.querySelectorAll('link[href*="editor"]').forEach(el => el.remove());
    
    // Remover elementos do editor
    clone.querySelectorAll('#edit-mode-toggle, #export-btn, #edit-control-panel, .editor-notification').forEach(el => el.remove());
    
    // Remover atributos de edição
    clone.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('title');
        el.style.outline = '';
        el.style.cursor = '';
        el.classList.remove('editable-active');
    });
    
    // Aplicar conteúdo editado
    const savedContent = JSON.parse(localStorage.getItem('bribellosEditedContent') || '{}');
    Object.keys(savedContent).forEach(path => {
        try {
            const element = clone.querySelector(path);
            if (element) {
                element.innerHTML = savedContent[path];
            }
        } catch (e) {}
    });
    
    // Atualizar WhatsApp
    const whatsappNumber = localStorage.getItem('bribellosWhatsAppNumber');
    if (whatsappNumber) {
        clone.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${whatsappNumber}`);
        });
    }
    
    return '<!DOCTYPE html>\n' + clone.outerHTML;
}

function generateCleanCSS() {
    // Copiar CSS original sem estilos do editor
    const styleEl = document.querySelector('link[href="style.css"]');
    if (!styleEl) {
        return '/* CSS original não encontrado */';
    }
    
    return fetch('style.css')
        .then(r => r.text())
        .catch(() => '/* Erro ao carregar CSS */');
}

function generateCleanJS() {
    return `// Menu Mobile
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if(hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if(navLinks.classList.contains('nav-active')) {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('toggle');
        }
    });
});

// FAQ Accordion
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navbarHeight = 100;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});`;
}

function generateReadme() {
    return `═══════════════════════════════════════════════════════
   🎉 SITE BRIBELLOS ESTÉTICA - VERSÃO FINALIZADA
═══════════════════════════════════════════════════════

📁 ARQUIVOS INCLUSOS:
─────────────────────
✓ index.html  - Página principal do site
✓ style.css   - Estilos e design
✓ script.js   - Funcionalidades (menu, FAQ, etc)
✓ LEIA-ME.txt - Este arquivo

🚀 COMO USAR:
─────────────────────
1. Coloque TODOS os 4 arquivos na mesma pasta
2. Abra o arquivo "index.html" no navegador
3. Pronto! Seu site está funcionando

🌐 PARA COLOCAR ONLINE:
─────────────────────
1. Contrate uma hospedagem (Hostinger, Hostgator, etc)
2. Faça upload dos 4 arquivos via FTP ou painel
3. Configure o domínio (www.bribellos.com.br)
4. Aguarde propagação (até 24h)
5. Acesse seu domínio - site no ar!

⚠️ IMPORTANTE:
─────────────────────
✓ Esta é a versão FINAL sem sistema de edição
✓ Não há botões de edição nesta versão
✓ Para fazer mudanças futuras:
  - Volte à versão com editor
  - Ou contrate um desenvolvedor
  - Ou aprenda HTML/CSS básico

✓ NUNCA delete ou renomeie os arquivos
✓ SEMPRE mantenha todos os 4 arquivos juntos
✓ GUARDE uma cópia de segurança

📱 NÚMERO DO WHATSAPP CONFIGURADO:
─────────────────────
${localStorage.getItem('bribellosWhatsAppNumber') || 'Não configurado'}

📊 ESTATÍSTICAS DA EDIÇÃO:
─────────────────────
Total de elementos editados: ${Object.keys(JSON.parse(localStorage.getItem('bribellosEditedContent') || '{}')).length}
Data de exportação: ${new Date().toLocaleString('pt-BR')}

💡 DICAS:
─────────────────────
• Teste o site antes de colocar online
• Verifique se todos os links funcionam
• Teste em celular e computador
• Peça para amigos testarem

📞 SUPORTE:
─────────────────────
Para alterações futuras, você precisará de:
• Conhecimentos básicos de HTML/CSS, OU
• Contratar um desenvolvedor web, OU
• Usar a versão editável novamente

═══════════════════════════════════════════════════════
        Gerado pelo Sistema de Edição Bribellos
              © 2024 - Todos os direitos reservados
═══════════════════════════════════════════════════════`;
}

function downloadFile(filename, content) {
    if (content instanceof Promise) {
        content.then(data => {
            const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    } else {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `editor-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

window.toggleEditMode = toggleEditMode;
window.closeControlPanel = closeControlPanel;
window.previewChanges = previewChanges;
window.resetAllContent = resetAllContent;
window.updateWhatsAppNumber = updateWhatsAppNumber;
window.exportStaticSite = exportStaticSite;
