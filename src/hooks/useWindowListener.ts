import { useEffect } from 'react';

/** This personalized hook handles the HTML windows listener event
 * 
 * @param eventType the event type (@see {@link https://developer.mozilla.org/en-US/docs/Web/Events})
 * @param listener the event listener callback
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener}
 */
export function useWindowListener(eventType:any, listener:(this: Window, ev: any) => any) {
  useEffect(() => {
    window.addEventListener(eventType, listener);
    return () => {
      window.removeEventListener(eventType, listener);
    };
  }, [eventType, listener]);
}
