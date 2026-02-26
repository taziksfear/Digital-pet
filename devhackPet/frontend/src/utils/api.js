const API_URL = '/api';

const getUserId = () => {
    const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (tgId) return tgId.toString();

    let localId = localStorage.getItem('local_user_id');
    if (!localId) {
        localId = 'web_' + Math.random().toString(36).substr(2, 9); // например: web_x8f9q2
        localStorage.setItem('local_user_id', localId);
    }
    return localId;
};

export const getPSt = async () => {
    try {
        const rs = await fetch(`${API_URL}/pet?userId=${getUserId()}&_t=${Date.now()}`);
        return await rs.json();
    } catch (e) {
        console.error('Ошибка связи с сервером:', e);
        return null;
    }
};

export const sndAct = async (action, payload = '') => {
    try {
        const rs = await fetch(`${API_URL}/act`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: getUserId(), 
                action: action, 
                payload: payload 
            })
        });
        return await rs.json();
    } catch (e) {
        console.error('Ошибка отправки действия:', e);
        return null;
    }
};