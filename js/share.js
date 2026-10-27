/**
 * Compartilhamento de resultado.
 * Tenta usar Web Share API; fallbacks para Clipboard API.
 */

export class Share {
  constructor(ui) {
    this.ui = ui;
  }

  async share(text) {
    // Tenta Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Palavra do Dia', text, url: window.location.href });
        return { success: true, method: 'web-share' };
      } catch (e) {
        // Usuário cancelou ou não suportado — cai no fallback
      }
    }

    // Fallback: Clipboard API
    try {
      await navigator.clipboard.writeText(text);
      this.ui.showToast('Copiado!');
      return { success: true, method: 'clipboard' };
    } catch (e) {
      // Fallback antigo
      return { success: this.fallbackCopy(text), method: 'fallback' };
    }
  }

  fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      if (!document.execCommand('copy')) throw new Error('Cópia recusada pelo navegador');
      this.ui.showToast('Copiado!');
      return true;
    } catch (e) {
      this.ui.showToast('Não foi possível copiar');
      return false;
    } finally {
      document.body.removeChild(ta);
    }
  }
}

export default Share;
