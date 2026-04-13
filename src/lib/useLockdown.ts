import { useEffect } from 'react';

export const useLockdown = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    // 1. Force Fullscreen
    const enterFullscreen = () => {
      const docElm = document.documentElement as any;
      try {
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    };

    // Fullscreen requires user interaction, so we'll try on the first click
    const handleFirstClick = () => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    };

    // Re-enter fullscreen if user tries to exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Optional: Show a warning or force back in on next click
      }
    };

    // 2. Block Back Button / Navigation
    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    // 3. Block Refresh and Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F5, Ctrl+R, Ctrl+Shift+R
      if (
        e.key === 'F5' || 
        (e.ctrlKey && e.key === 'r') || 
        (e.ctrlKey && e.shiftKey && e.key === 'R') ||
        // F12 (DevTools)
        e.key === 'F12' ||
        // Ctrl+Shift+I (DevTools)
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        // Alt+Tab, Win key (Hard to block but we can try to detect blur)
        e.key === 'Meta' ||
        // Alt + Left/Right (Navigation)
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 4. Prevent Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 5. Prevent BeforeUnload (Refresh/Close)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('click', handleFirstClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('popstate', preventBack);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [active]);
};
