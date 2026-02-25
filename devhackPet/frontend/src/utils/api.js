const A_URL = 'http://localhost:8080/api';

const getUId = () => window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 'tst_1';

export const getPSt = async () => {
    const rs = await fetch(`${A_URL}/pet?uId=${getUId()}`);
    return await rs.json();
};

export const sndAct = async (act, pLd = '') => {
    const rs = await fetch(`${A_URL}/act`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uId: getUId(), act, pLd })
    });
    return await rs.json();
};