import { use, useEffect, useState } from 'react'
import { Mistral } from '@mistralai/mistralai';
import './App.css'


const apiKey = "w6RmSlWWDPpfY6WkFZU2PlLDQ4FYaybE";
const mistral = new Mistral({ apiKey: apiKey });



function App() {
  const [isRulesSet, setIsRulesSet] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [decidedRules, setDecidedRules] = useState(null);
  const [itemsSoFar, setItemsSoFar] = useState([]);
  const [canBringItem, setCanBringItem] = useState([]);
  const [cannotBringItem, setCannotBringItem] = useState([]);

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

  async function setRules() {
    console.log("Setting rules...");
    setIsRulesSet(true);
    try{
      const res = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: promptForRules }],
        responseFormat: { type: 'json_object' },
        temperature: 1.3,
      });
      //const data = await res.json();
      const parsedRules = JSON.parse(res.choices[0].message.content);

      await speak(`I am going to picnic and I am bringing, ${parsedRules.item}`)

      setDecidedRules(parsedRules.rule);
      setItemsSoFar(prevItems => [...prevItems, parsedRules.item]);
      setCanBringItem(prevItems => [...prevItems, parsedRules.item]);
      console.log("parsedRules",parsedRules);
    } catch (error) {
      console.error("Error setting rules:", error);
    }

    
  }

    async function checkItem(item) {
      console.log("decidedRules",decidedRules);
      let userPrompt = `
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
      `
      console.log(userPrompt);
      console.log(item);

      try{
      const res = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: userPrompt }],
        responseFormat: { type: 'json_object' },
        temperature: 1.0,
      });
      const parsedRules = JSON.parse(res.choices[0].message.content);
      setItemsSoFar(prevItems => [...prevItems, parsedRules.item]);
      setItemsSoFar(prevItems => [...prevItems, item]);
      

      if(parsedRules.canBring === true){
        setCanBringItem(prevItems => [...prevItems, item]);
        await speak(`Yes, you can bring ${item}`)
      } else {
        setCannotBringItem(prevItems => [...prevItems, item]);
        await speak(`No, you cannot bring ${item}`)
      }
      setCanBringItem(prevItems => [...prevItems, parsedRules.item]);
      

      await speak(`I am going to picnic and I am bringing, ${parsedRules.item}`)
      console.log(parsedRules);
      console.log("itemsSoFar",itemsSoFar);
    } catch (error) {
      console.error("Error setting rules:", error);
    }
    }
    async function checkRule(userRule){
        let userPrompt = `
        You are the Game Master for a picnic packing game. 
        The User is trying to guess the System's secret rule.
        
        USER GUESS: "I think the rule you set is '${userRule}'"
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

        console.log(userPrompt);
        try{
          const res = await mistral.chat.complete({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: userPrompt }],
            responseFormat: { type: 'json_object' },
            temperature: 0.5,
          });
          console.log(res.choices[0].message.content);
          const parsedRules = JSON.parse(res.choices[0].message.content);
          if(parsedRules.match){
            setIsGameOver(true);
            setIsWon(true);
            setIsRulesSet(false);
            speak(`Congratulations! Your guess is correct. The rule was indeed "${decidedRules}". You win!`);
          } else {
            speak(`Sorry, your guess is not correct. Keep trying!`);
          }
          console.log("Does user's rule match with system's rule?", parsedRules.match);
        } catch (error) {
          console.error("Error checking rules:", error);
        }
    }


  const speak = (text) => {
    window.speechSynthesis.cancel();
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });
  };

  if (isGameOver) {
    if(isWon){
      return (
        <>
          <h1>Congratulations! You won the game!</h1>
          <h2>The rule was: {decidedRules}</h2>
        </>
      )
    }
    else {
    return (
      <>
        <h1>Game Over!</h1>
        <h2>The rule was: {decidedRules}</h2>
      </>
    )
    }
  }
  else if (isRulesSet) {
    return (
      <>
        <input type="text" placeholder="Enter your item" onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const userItem = e.target.value;
            console.log("User item:", userItem);
            checkItem(userItem);
          }
        }} />
        <input type="text" placeholder="Enter your guess for the rule" onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const userRule = e.target.value;
            console.log("User rule guess:", userRule);
            checkRule(userRule);
          }
        }} />
        <button onClick={() => {setIsGameOver(true); setIsRulesSet(false);}}>Give Up!</button>
        <div>
          <ul>
            {canBringItem.map((item, index) => (
              <li key={index} style={{ color: 'green' }}>{item}</li>
            ))}
            {cannotBringItem.map((item, index) => (
              <li key={index} style={{ color: 'red' }}>{item}</li>
            ))}
          </ul>
        </div>
      </>
    )
  } 
  else if (!isRulesSet && !isGameOver) {
    return (
      <>
        <button onClick={setRules}>Start</button>
      </>
    )
  }
  
}

export default App