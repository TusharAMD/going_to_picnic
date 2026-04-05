import { useEffect, useState, useRef } from 'react'
import { Mistral } from '@mistralai/mistralai';

const apiKey = "w6RmSlWWDPpfY6WkFZU2PlLDQ4FYaybE";
const mistral = new Mistral({ apiKey: apiKey });

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html { -webkit-text-size-adjust: 100%; }

  body {
    background-color: #fdf6e3;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .game-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px 14px 80px;
    background:
      radial-gradient(ellipse at 70% 0%, #b7f0a8 0%, transparent 55%),
      radial-gradient(ellipse at 10% 100%, #ffe599 0%, transparent 50%),
      #fdf6e3;
    position: relative;
    overflow-x: hidden;
  }

  /* Checkerboard stripe at top */
  .game-root::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 10px;
    background-image: repeating-linear-gradient(
      90deg,
      #e84545 0px, #e84545 10px,
      #ffffff 10px, #ffffff 20px
    );
    z-index: 100;
  }

  /* ── TITLE ── */
  .title-area {
    text-align: center;
    margin-top: 22px;
    margin-bottom: 6px;
    width: 100%;
  }

  .title-emoji {
    font-size: clamp(36px, 10vw, 56px);
    display: block;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  h1.game-title {
    font-family: 'Fredoka One', cursive;
    font-size: clamp(1.6rem, 7vw, 3rem);
    color: #2d6a2d;
    letter-spacing: 1px;
    margin-top: 4px;
    text-shadow: 3px 3px 0 #b7f0a8;
  }

  .subtitle {
    font-size: clamp(0.85rem, 3.5vw, 1rem);
    color: #7a9e4e;
    font-weight: 600;
    margin-top: 4px;
  }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: 'Fredoka One', cursive;
    font-size: clamp(0.95rem, 3.5vw, 1.1rem);
    letter-spacing: 0.5px;
    border: none;
    border-radius: 50px;
    padding: 12px 22px;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .btn:active {
    transform: translate(3px, 3px) !important;
    box-shadow: none !important;
  }

  .btn-start {
    background: #2d6a2d;
    color: white;
    box-shadow: 4px 4px 0 #1a3d1a;
    font-size: clamp(1rem, 4vw, 1.3rem);
    padding: 14px 36px;
    width: 100%;
    max-width: 280px;
  }
  .btn-start:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #1a3d1a; }

  .btn-check {
    background: #4caf50;
    color: white;
    box-shadow: 4px 4px 0 #2e7d32;
    width: 100%;
  }
  .btn-check:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #2e7d32; }

  .btn-guess {
    background: #ff9800;
    color: white;
    box-shadow: 4px 4px 0 #e65100;
    width: 100%;
  }
  .btn-guess:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #e65100; }

  .btn-giveup {
    background: #fff5f5;
    color: #c0392b;
    border: 2px solid #c0392b;
    box-shadow: 3px 3px 0 #c0392b;
    width: 100%;
  }
  .btn-giveup:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #c0392b; }

  .btn-restart {
    background: #2d6a2d;
    color: white;
    box-shadow: 4px 4px 0 #1a3d1a;
    font-size: clamp(1rem, 4vw, 1.2rem);
    padding: 14px 36px;
    margin-top: 16px;
    width: 100%;
    max-width: 260px;
  }
  .btn-restart:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #1a3d1a; }

  .btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── START SCREEN ── */
  .start-card {
    background: white;
    border-radius: 22px;
    border: 3px solid #2d6a2d;
    box-shadow: 5px 5px 0 #2d6a2d;
    padding: 28px 22px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    margin-top: 24px;
  }

  .start-card p {
    color: #555;
    font-size: clamp(0.9rem, 3.5vw, 1rem);
    line-height: 1.65;
    margin-bottom: 24px;
  }

  .start-card p strong { color: #2d6a2d; }

  /* ── LOADING ── */
  .loading-card {
    background: white;
    border-radius: 22px;
    border: 3px solid #2d6a2d;
    box-shadow: 5px 5px 0 #2d6a2d;
    padding: 40px 28px;
    text-align: center;
    margin-top: 28px;
    max-width: 340px;
    width: 100%;
  }

  .loading-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 18px 0;
  }

  .loading-dots span {
    width: 13px; height: 13px;
    background: #4caf50;
    border-radius: 50%;
    animation: dot-bounce 1.2s ease-in-out infinite;
  }

  .loading-dots span:nth-child(2) { animation-delay: 0.2s; background: #ff9800; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; background: #e84545; }

  @keyframes dot-bounce {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40% { transform: scale(1.2); opacity: 1; }
  }

  /* ── GAME LAYOUT ── */
  /* Mobile-first: single column */
  .game-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 860px;
    width: 100%;
    margin-top: 20px;
  }

  /* Desktop: side-by-side */
  @media (min-width: 660px) {
    .game-layout {
      display: grid;
      grid-template-columns: 1fr minmax(200px, 240px);
      align-items: start;
    }
  }

  .game-main {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── INPUT CARDS ── */
  .input-card {
    background: white;
    border-radius: 18px;
    border: 3px solid #2d6a2d;
    box-shadow: 4px 4px 0 #2d6a2d;
    padding: 16px 18px;
  }

  .input-card label {
    display: block;
    font-family: 'Fredoka One', cursive;
    color: #2d6a2d;
    font-size: clamp(0.9rem, 3.5vw, 1rem);
    margin-bottom: 10px;
  }

  /* Stack vertically on mobile, row on wider screens */
  .input-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  @media (min-width: 480px) {
    .input-row {
      flex-direction: row;
      align-items: center;
    }
    .input-row .btn { width: auto; flex-shrink: 0; }
  }

  .text-input {
    width: 100%;
    font-family: 'Nunito', sans-serif;
    font-size: clamp(0.9rem, 3.5vw, 1rem);
    font-weight: 700;
    padding: 11px 18px;
    border: 2.5px solid #b7f0a8;
    border-radius: 50px;
    background: #f9fdf4;
    color: #2d6a2d;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }

  .text-input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.18);
  }

  .text-input::placeholder { color: #aac8a0; }

  .rule-input {
    border-color: #ffd180;
    background: #fffdf4;
    color: #7a4f00;
  }

  .rule-input:focus {
    border-color: #ff9800;
    box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.18);
  }

  .rule-input::placeholder { color: #d4aa6a; }

  /* ── BASKET SIDEBAR ── */
  .basket-card {
    background: white;
    border-radius: 18px;
    border: 3px solid #2d6a2d;
    box-shadow: 4px 4px 0 #2d6a2d;
    padding: 16px 18px 20px;
  }

  @media (min-width: 660px) {
    .basket-card { position: sticky; top: 20px; }
  }

  .basket-title {
    font-family: 'Fredoka One', cursive;
    color: #2d6a2d;
    font-size: clamp(1rem, 4vw, 1.2rem);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }

  /* On mobile: horizontal scrolling chip row. On desktop: vertical list */
  .item-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    max-height: 160px;
    overflow-y: auto;
    padding: 2px;
  }

  @media (min-width: 660px) {
    .item-list {
      flex-direction: column;
      flex-wrap: nowrap;
      max-height: 360px;
    }
  }

  .item-list li {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: clamp(0.8rem, 3vw, 0.93rem);
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 50px;
    animation: fadeSlideIn 0.3s ease;
    white-space: nowrap;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .item-allowed {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1.5px solid #a5d6a7;
  }

  .item-denied {
    background: #ffebee;
    color: #c62828;
    border: 1.5px solid #ef9a9a;
    text-decoration: line-through;
    text-decoration-color: #ef9a9a;
  }

  .empty-basket {
    text-align: center;
    color: #aac8a0;
    font-size: 0.88rem;
    padding: 10px 0;
  }

  /* ── TOAST ── */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: #2d6a2d;
    color: white;
    font-family: 'Fredoka One', cursive;
    font-size: clamp(0.85rem, 3.5vw, 1rem);
    padding: 11px 22px;
    border-radius: 50px;
    box-shadow: 4px 4px 0 #1a3d1a;
    opacity: 0;
    transition: transform 0.35s cubic-bezier(.17,.67,.45,1.3), opacity 0.3s;
    z-index: 200;
    white-space: nowrap;
    max-width: calc(100vw - 32px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toast.toast-show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  .toast.toast-deny {
    background: #c62828;
    box-shadow: 4px 4px 0 #7f0000;
  }

  /* ── END SCREEN ── */
  .end-card {
    background: white;
    border-radius: 22px;
    border: 3px solid #2d6a2d;
    box-shadow: 6px 6px 0 #2d6a2d;
    padding: 36px 24px;
    max-width: 440px;
    width: 100%;
    text-align: center;
    margin-top: 28px;
    animation: popIn 0.5s cubic-bezier(.17,.67,.45,1.4);
  }

  @keyframes popIn {
    from { transform: scale(0.7); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .end-emoji { font-size: clamp(48px, 15vw, 72px); display: block; margin-bottom: 10px; }

  .end-title {
    font-family: 'Fredoka One', cursive;
    font-size: clamp(1.5rem, 6vw, 2rem);
    margin-bottom: 8px;
  }

  .win .end-title { color: #2d6a2d; }
  .lose .end-title { color: #c62828; }

  .rule-reveal {
    margin-top: 18px;
    background: #f9fdf4;
    border: 2px dashed #4caf50;
    border-radius: 14px;
    padding: 14px 16px;
    font-size: clamp(0.88rem, 3.5vw, 0.95rem);
    color: #555;
    line-height: 1.5;
    text-align: left;
  }

  .rule-reveal strong {
    display: block;
    font-family: 'Fredoka One', cursive;
    color: #2d6a2d;
    font-size: clamp(0.9rem, 3.5vw, 1.05rem);
    margin-bottom: 4px;
  }
`;

function Toast({ message, type }) {
  return (
    <div className={`toast ${message ? 'toast-show' : ''} ${type === 'deny' ? 'toast-deny' : ''}`}>
      {type === 'deny' ? '❌ ' : '✅ '}{message}
    </div>
  );
}

function App() {
  const [phase, setPhase] = useState('start'); // start | loading | playing | end
  const [isWon, setIsWon] = useState(false);
  const [decidedRules, setDecidedRules] = useState(null);
  const [itemsSoFar, setItemsSoFar] = useState([]);
  const [canBringItems, setCanBringItems] = useState([]);
  const [cannotBringItems, setCannotBringItems] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [ruleInput, setRuleInput] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isChecking, setIsChecking] = useState(false);
  const toastTimer = useRef(null);

  // Inject styles once
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  function showToast(message, type = 'allow') {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: '', type: '' }), 3000);
  }

  const speak = (text) => {
    window.speechSynthesis.cancel();
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });
  };

  const promptForRules = `
  ### Instruction
You are the Game Master for a picnic packing game. Your task is to invent a secret classification rule (e.g., "items must start with a vowel," "items must be edible," "items must be green") and then engage in a turn-based game. These are just examples; your rule can be anything you choose, as long as it is consistent.

### Rules of Engagement
1. **The Secret Rule**: You must decide on a consistent rule. Do not reveal this rule to the user in prose, but it must be stored in the JSON "rule" field for the system's backend.
2. **Evaluation**: When the user suggests an item, you must internally evaluate it against your rule.
3. **Turn-Taking**: 
   - You start the game by providing the first valid item.
   - For every subsequent turn, you will evaluate the user's item and then provide another valid item of your own.
4. **Output Format**: You must respond ONLY in strict JSON format. No conversational filler.

### JSON Schema
{
  "rule": "The specific logic for the game",
  "item": "Your single new item for the picnic"
}

### Initial Task
Generate the secret rule and provide the first item to start the game.

Response:
  `;

  console.log("Prompt for rules:", promptForRules);

  async function startGame() {
    setPhase('loading');
    try {
      /*const res = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: promptForRules }],
        responseFormat: { type: 'json_object' },
        temperature: 0.8,
      });
      const parsed = JSON.parse(res.choices[0].message.content);*/
      //const parsed = { rule: "The item must be the name of a mammal", item: "squirrel" }; 
      const parsed = { rule: "Items must be the name of a fictional creature or character from any mythological, literary, or fantasy source.", item: "Pegasus" };
      setDecidedRules(parsed.rule);
      setItemsSoFar([parsed.item]);
      setCanBringItems([{ text: parsed.item, byAI: true }]);
      speak(`I am going to the picnic and I am bringing ${parsed.item}`);
      setPhase('playing');
      console.log("Parsed rules on game start:", parsed);
    } catch (err) {
      console.error(err);
      setPhase('start');
    }
  }

  async function handleCheckItem() {
    if (!itemInput.trim() || isChecking) return;
    const item = itemInput.trim();
    setItemInput('');
    setIsChecking(true);

    const prompt = `
      You are the Game Master for a picnic packing game. Your task is to evaluate the user's item against the secret rule.

      ### RULE
      The rule which we decided is: ${decidedRules}.
      ### ITEMS 
      The items decided so far are: ${itemsSoFar}.
      Do not include items decided so far in the next item suggestion.

      ### USER ITEM
      Now, The user suggested the item is "${item}". 
      Does it fit the rule? If yes, set canBring to true in json
      Also provide another item in json respecting the rule decided above and should not belong to items decided so far. 
      Remember to respond only in JSON format with the same schema
      ### JSON Schema
      {
        "canBring": "true/false",
        "item": "Next single item for the picnic"
      }
      `;
      console.log("Prompt for checking item:", prompt);
      console.log("User item:", item);
    try {
      const res = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
        temperature: 0.5,
      });
      const parsed = JSON.parse(res.choices[0].message.content);

      setItemsSoFar(prev => [...prev, item, parsed.item]);

      if (parsed.canBring === true) {
        setCanBringItems(prev => [...prev, { text: item, byAI: false }]);
        showToast(`${item} is welcome! 🎉`, 'allow');
        await speak(`Yes, you can bring ${item}`);
      } else {
        setCannotBringItems(prev => [...prev, { text: item }]);
        showToast(`${item} stays home 🚫`, 'deny');
        await speak(`No, you cannot bring ${item}`);
      }

      setCanBringItems(prev => [...prev, { text: parsed.item, byAI: true }]);
      await speak(`I am going to the picnic and I am bringing ${parsed.item}`);
      console.log("Parsed response for item check:", parsed);
    } catch (err) {
      console.error(err);
    }
    setIsChecking(false);
  }

  async function handleCheckRule() {
    if (!ruleInput.trim() || isChecking) return;
    const guess = ruleInput.trim();
    setRuleInput('');
    setIsChecking(true);

    const prompt = `
        You are the Game Master for a picnic packing game. 
        The User is trying to guess the System's secret rule.
        
        USER GUESS: "I think the rule you set is '${guess}'"
        SYSTEM RULE: "${decidedRules}"

        TASK:
        Determine if the User's guess is semantically the same as the System Rule. 
        - If the User identifies the core logic (e.g., the price limit), it is a MATCH.
        - Ignore extra technical details in the System Rule (like "no rounding up") that the user wouldn't know word-for-word.
        - Treat "Bird?" as a match for "The item must be a bird".

        CRITICAL INSTRUCTION:
        - This is a "fuzzy match" game. 
        - If the user's guess covers the GENERAL CATEGORY of the system rule (e.g., price, color, species), count it as a MATCH.
        - If the user says "Cheap" and the rule is "$2 or less", this IS A MATCH because they identified the price-based logic.
        
        Output JSON:
        { "match": true/false }`;
         console.log("Prompt for checking rule:", prompt);
         console.log("User guess for rule:", guess);
    try {
      const res = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
        temperature: 0.5,
      });
      const parsed = JSON.parse(res.choices[0].message.content);
      console.log("Parsed response for rule check:", parsed);
      if (parsed.match) {
        setIsWon(true);
        setPhase('end');
        speak(`Congratulations! The rule was "${decidedRules}" You win!`);
      } else {
        showToast("Not quite — keep guessing! 🤔", 'deny');
        speak("Sorry, that's not the rule. Keep trying!");
      }
    } catch (err) {
      console.error(err);
    }
    setIsChecking(false);
  }

  async function handleGiveUp() {
    setIsWon(false);
    setPhase('end');
    await speak(`The rule was "${decidedRules}"`);
    window.speechSynthesis.cancel();
  }

  function handleRestart() {
    setPhase('start');
    setIsWon(false);
    setDecidedRules(null);
    setItemsSoFar([]);
    setCanBringItems([]);
    setCannotBringItems([]);
    setItemInput('');
    setRuleInput('');
    window.speechSynthesis.cancel();
  }

  const allBasketItems = [
    ...canBringItems.map(i => ({ ...i, allowed: true })),
    ...cannotBringItems.map(i => ({ ...i, allowed: false })),
  ];

  return (
    <div className="game-root">
      {/* Title */}
      <div className="title-area">
        <span className="title-emoji">🧺</span>
        <h1 className="game-title">Picnic Packing Game</h1>
        {phase === 'playing' && (
          <p className="subtitle">Figure out the secret rule!</p>
        )}
      </div>

      {/* START */}
      {phase === 'start' && (
        <div className="start-card">
          <p>
            I'm going on a picnic and I'll only bring certain things.
            <br /><br />
            <strong>Your mission:</strong> Suggest items and figure out my <strong>secret rule</strong>!
            Each round I'll tell you if your item is welcome or not. 🕵️
          </p>
          <button className="btn btn-start" onClick={startGame}>
            🎉 Start the Picnic!
          </button>
        </div>
      )}

      {/* LOADING */}
      {phase === 'loading' && (
        <div className="loading-card">
          <p style={{ fontFamily: "'Fredoka One', cursive", color: '#2d6a2d', fontSize: '1.2rem' }}>
            Packing the basket...
          </p>
          <div className="loading-dots">
            <span /><span /><span />
          </div>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>The Game Master is picking a secret rule!</p>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && (
        <div className="game-layout">
          <div className="game-main">
            {/* Item Input */}
            <div className="input-card">
              <label>🥕 Suggest an item to bring:</label>
              <div className="input-row">
                <input
                  className="text-input"
                  type="text"
                  placeholder="e.g. apple, umbrella, flute..."
                  value={itemInput}
                  onChange={e => setItemInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheckItem()}
                  disabled={isChecking}
                />
                <button className="btn btn-check" onClick={handleCheckItem} disabled={isChecking}>
                  {isChecking ? '⏳' : '✔ Check'}
                </button>
              </div>
            </div>

            {/* Rule Guess Input */}
            <div className="input-card">
              <label>🔍 Guess the secret rule:</label>
              <div className="input-row">
                <input
                  className="text-input rule-input"
                  type="text"
                  placeholder="e.g. items that start with a vowel..."
                  value={ruleInput}
                  onChange={e => setRuleInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheckRule()}
                  disabled={isChecking}
                />
                <button className="btn btn-guess" onClick={handleCheckRule} disabled={isChecking}>
                  {isChecking ? '⏳' : '🔍 Guess'}
                </button>
              </div>
            </div>

            {/* Give Up */}
            <button className="btn btn-giveup" onClick={handleGiveUp}>
              🏳️ Give Up
            </button>
          </div>

          {/* Basket Sidebar */}
          <div className="basket-card">
            <div className="basket-title">🧺 The Basket</div>
            {allBasketItems.length === 0 ? (
              <p className="empty-basket">Nothing yet — start suggesting!</p>
            ) : (
              <ul className="item-list">
                {canBringItems.map((it, i) => (
                  <li key={`allow-${i}`} className="item-allowed">
                    {it.byAI ? '🤖' : '🙋'} {it.text}
                  </li>
                ))}
                {cannotBringItems.map((it, i) => (
                  <li key={`deny-${i}`} className="item-denied">
                    ❌ {it.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* END */}
      {phase === 'end' && (
        <div className={`end-card ${isWon ? 'win' : 'lose'}`}>
          <span className="end-emoji">{isWon ? '🏆' : '😔'}</span>
          <h2 className="end-title">
            {isWon ? 'You figured it out!' : 'Better luck next time!'}
          </h2>
          <div className="rule-reveal">
            <strong>The Secret Rule was:</strong>
            {decidedRules}
          </div>
          <button className="btn btn-restart" onClick={handleRestart}>
            🔄 Play Again
          </button>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}

export default App;
