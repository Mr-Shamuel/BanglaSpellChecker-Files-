  const  BanglaSpellCheckScript =()=>{
    // Create script elements
    const jqueryScript = document.createElement('script');
    jqueryScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js';
    document.body.appendChild(jqueryScript);

    const jqueryUiScript = document.createElement('script');
    jqueryUiScript.src = 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js';
    document.body.appendChild(jqueryUiScript);

    const banglaSpellerCss = document.createElement('link');
    banglaSpellerCss.href = 'https://bangla.plus/banglaspeller.css';
    banglaSpellerCss.rel = 'stylesheet';
    document.head.appendChild(banglaSpellerCss);

    const banglaSpellerScript = document.createElement('script');
    banglaSpellerScript.src = 'https://bangla.plus/banglaspeller.js';
    document.body.appendChild(banglaSpellerScript);
}

//   const handleSpellCheckerFocusOut = () => {
//     if (window.BanglaSpeller) {
//         window.BanglaSpeller('#input-area');

//     }
// };


export {
    BanglaSpellCheckScript,
    // handleSpellCheckerFocusOut
}
