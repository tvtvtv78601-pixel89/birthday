// Global Variables & State
let currentScreen = 1;
let isMuted = false;
let noClickCount = 0;
let currentQuestionIndex = 0;
let questionsAnswered = 0;

// Discord Webhook Configuration
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1545375277805477979/5evE88G2SRi7j1pY5BSUvDL-s84Wj0Z6gIGPnwZsrLNuVIgswPY4BqzDrfyULb5sfnf0";

// Secretly records all answers in memory without showing anything to the user
const recordedAnswers = [];

// Web Audio API Synthesizer for rich audio feedback (works even without mp3 files)
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.isInitialized = true;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (isMuted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {
            console.log('Synth error:', e);
        }
    }

    playSuccess() {
        if (isMuted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
                gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.09);
                osc.stop(this.ctx.currentTime + idx * 0.09 + 0.4);
            });
        } catch (e) {
            console.log('Synth error:', e);
        }
    }

    playShyChime() {
        if (isMuted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const notes = [880, 1046.50, 1318.51]; // A5, C6, E6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
                gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.5);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.12);
                osc.stop(this.ctx.currentTime + idx * 0.12 + 0.5);
            });
        } catch (e) {
            console.log('Synth error:', e);
        }
    }

    playCelebrationFanfare() {
        if (isMuted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const chords = [
                [523.25, 659.25, 783.99],
                [587.33, 739.99, 880.00],
                [659.25, 830.61, 987.77],
                [783.99, 987.77, 1174.66, 1567.98]
            ];
            chords.forEach((chord, step) => {
                chord.forEach(freq => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + step * 0.16);
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime + step * 0.16);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + step * 0.16 + 0.6);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(this.ctx.currentTime + step * 0.16);
                    osc.stop(this.ctx.currentTime + step * 0.16 + 0.6);
                });
            });
        } catch (e) {
            console.log('Synth error:', e);
        }
    }
}

const synth = new SoundEngine();

// Audio Elements
const bgMusic = document.getElementById('bgMusic');
const clickSound = document.getElementById('clickSound');
const successSound = document.getElementById('successSound');

function playClick() {
    synth.playClick();
    if (!isMuted && clickSound && clickSound.readyState >= 2) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }
}

function playSuccess() {
    synth.playSuccess();
    if (!isMuted && successSound && successSound.readyState >= 2) {
        successSound.currentTime = 0;
        successSound.play().catch(() => {});
    }
}

// Romantic & Comprehensive Question Flow:
// Romantic & Comprehensive Question Flow:
// 1-5: Masti Bhare Sawal (5 questions)
// 6-15: Love, Tareef & Romance (10 questions)
// 16-19: Intimacy & Deep Closeness (4 questions at the end)
const romanticQuestions = [
    // --- 🎭 5 MASTI BHARE SAWAL ---
    {
        category: "😂 Masti Bhara Sawal 1/5 😂",
        question: "Hina G, sach sach bataiye ga... agar hum dono ki kabhi ladaai ho jaye (jo ke namumkin hai), toh pehle 'Sorry Jaan' kon bolega? 😂❤️",
        type: "buttons",
        yesText: "Aap hi bolenge hamesha 😌",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Hahaha bilkul sahi! 😂 Chahe galti kisi ki bhi ho, meri rani ko manana toh mera hi farz hai na! 🥹❤️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapka ye pyara sa sharmaana hi saari ladaaiyan pehle hi khatam kar deta hai! 🥹💕"
    },
    {
        category: "😂 Masti Bhara Sawal 2/5 😂",
        question: "Kya aapko pata hai ke aap meri poori zindagi mein kitni zyada ziddi, pyari aur cute hain? 😂❤️",
        type: "buttons",
        yesText: "Haan, main ziddi hoon par sirf aapke liye 😍",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Aur aapki yehi zidd toh mujhe sabse zyada pasand hai meri jaan! 🥹❤️ Aapki har zidd sar aankhon par!",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Sharmati hui aur bhi 100 guna zyada cute lagti hain aap! 🥰✨"
    },
    {
        category: "😂 Masti Bhara Sawal 3/5 😂",
        question: "Aapko sabse zyada maza kis cheez mein aata hai? Mujhe be-wajah tang karne mein ya mere se laad ladaane mein? 😜💕",
        type: "radio",
        options: [
            { text: "Dono mein! Pehle tang karna phir dher sara laad ladaana 😜🥰", value: "combo" },
            { text: "Sirf aapse be-inteha laad ladaana aur pyaar karna 🥹❤️", value: "pure_love" },
            { text: "Aapko satana aur phir aapka cute reaction dekhna 😂❤️", value: "tease" }
        ],
        responses: {
            "combo": "Uff! Yeh combo toh qatilana hai meri jaan! 🥰🔥 Pehle tang karein phir pyaar karein, main dono par raazi hoon!",
            "pure_love": "Aww mera pyara bachha! 🥹❤️ Main bhi aapse be-inteha laad ladaunga aur palkon par bithha kar rakhunga!",
            "tease": "Hahaha bohot shaitan hain aap! 😂 Lekin aapki sharafat aur shaitani dono se mujhe be-panaah mohabbat hai!"
        }
    },
    {
        category: "😂 Masti Bhara Sawal 4/5 😂",
        question: "Agar main achanak aapse bohot saari chocolate aur ice-cream chheen lun, toh aapka reaction kya hoga? 🍦😂",
        type: "buttons",
        yesText: "Aapse ladaai karungi aur chheen lungi 😤",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Hahaha meri gusse wali rani! 😂 Main toh apni saari chocolates aur apni jaan bhi aapke naam kar doon! 🥹🍫❤️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aap bas muskura dein, main poori dunya ki ice-cream aapke aage rakh doon! 🍦✨"
    },
    {
        category: "😂 Masti Bhara Sawal 5/5 😂",
        question: "Hina G, kya aap maanti hain ke aap meri life ki sabse pyari nautanki aur meri number #1 shona hain? 😂❤️",
        type: "buttons",
        yesText: "YES! Main sirf aapki shona hoon 😍❤️",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Meri pyari shona! 🥹❤️ Aapki nautanki aur adaayein hi toh meri zindagi ka sabse bada sukoon hain!",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapki is pyari si sharam pe toh main lakh baar qurban jaun! 💕✨"
    },

    // --- 💖 10 LOVE & ROMANTIC QUESTIONS ---
    {
        category: "✨ Husn & Tareef 1/10 ✨",
        question: "Hina G, sach sach bataiye ga... 🥰<br>Aapki aankhon aur pyari si smile mein itna noor kahan se aata hai? Jab bhi aapko dekhta hoon, dil khushi se jhoom uthta hai! ✨",
        type: "buttons",
        yesText: "Aapke pyaar ka noor hai 😍❤️",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Hayee! 🥹❤️ Aapki yahi pyari baatein toh mera dil jeet leti hain... Meri sabse khoobsurat Hina G! 💕",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aap jab bhi sharmati hain, qasam se dunya ki sabse pyaari lagti hain! 🥹✨"
    },
    {
        category: "💖 Dil Ka Rishta 2/10 💖",
        question: "Hina G... 🌹<br>Kya aapko andaza hai ke aap mere liye kitni anmol hain?<br>Aap meri Wife bhi hain, Girlfriend bhi, Lover bhi aur mera sabse pyara Sukoon bhi! 🕊️❤️",
        type: "buttons",
        yesText: "Jee haan, main sirf aapki hoon 🥰",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Aapka ye kehna hi meri poori zindagi ka sabse bada khazana hai! ❤️♾️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapka sharmaana hi toh meri jaan le leta hai! Bas hamesha aise hi muskuraati rahein 🥹💕"
    },
    {
        category: "💌 Be-Panah Mohabbat 3/10 💌",
        question: "Aapke bina meri subah adhoori hoti hai aur raat ko sukoon nahi milta... Kya aapko bhi meri itni hi be-chaini se yaad aati hai? 🥹❤️",
        type: "buttons",
        yesText: "Har pal sirf aapki hi yaad rehti hai 🥰",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Mera dil bhar aaya sun kar... 🥹❤️ Hum dono ki roohein ek dusre se judi hain meri jaan!",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapka khayal hi meri har saans ko mehka deta hai! 🌸✨"
    },
    {
        category: "🌸 Khuda Ka Inaam 4/10 🌸",
        question: "Jab aap pehli baar mere dil mein aayi theen, kya aapko pata tha ke aap meri poori dunya aur meri qismat ban jayengi? 🌸✨",
        type: "buttons",
        yesText: "Mujhe mehsoos ho gaya tha ke aap mere hain 😍",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Allah ne hum dono ko ek dusre ke liye banaya hai... Ye rishta hamesha zinda rahega! ♾️❤️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapka mere naseeb mein aana meri zindagi ka sabse bada moajza hai! 🥹💕"
    },
    {
        category: "💍 Hamesha Ka Saath 5/10 💍",
        question: "Agar mujhe zindagi mein sirf ek hi khwahish maangne ki ijazat mile, toh main har lamha aapka saath maangunga... Kya aap hamesha mera haath thaame rakhengi? 💍❤️",
        type: "buttons",
        yesText: "Hamesha, aakhri saans tak aapka haath nahi chorungi 🥹❤️",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Aapka ye waada mere jeene ki wajah hai... Meri rani, meri jaan! 💍❤️♾️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapka haath mere haath mein hona hi mera sabse bada fakhar hai! 🥹💕"
    },
    {
        category: "🕊️ Mera Sukoon 6/10 🕊️",
        question: "Aapki meethi aawaz sun kar mera saara stress aur fikrein hawa ho jati hain... Kya aapko pata hai aap mere liye kitna bada sukoon hain? 🕊️💕",
        type: "buttons",
        yesText: "Aapka sukoon hi meri sabse badi khushi hai 🥰",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Aap jaisi pyari aur caring humsafar paane ke liye log tarsein... aur main kitna naseebon wala hoon! 🥹❤️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapki muskurahat hi meri har thakan ka ilaaj hai! 💕✨"
    },
    {
        category: "🫂 Warmth & Hugs 7/10 🫂",
        question: "Kya main aapko apni baahon mein kas ke le sakta hoon?<br>Aur itna pyaar karoon ke aapki saari thakan aur fikrein door ho jayein? 🥹❤️",
        type: "buttons",
        yesText: "Hamesha apni baahon mein mehfooz rakhein 🥰🫂",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Aapko kabhi khud se door nahi hone dunga jaan... Meri saari khushiyan aapke naam! 🫂❤️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aa jaiye mere kareeb, aapka sharmaana aur bhi pyara lagta hai! 🥰💕"
    },
    {
        category: "🌹 Noorani Chehra 8/10 🌹",
        question: "Hina G, meri poori zindagi mein aapke chehre ki muskurahat se badh kar koi cheez qeemti nahi hai... Kya aap hamesha aise hi khilkhilati rahengi? 🥹🌹",
        type: "buttons",
        yesText: "InshaAllah, aapke saath hamesha muskuraungi 🥰",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Aapki smile par meri jaan nisar hai... Allah aapko hamesha aise hi khush aur aabad rakhe! ❤️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapki muskurahat dekh kar mera din roshan ho jata hai! 🥹🌹"
    },
    {
        category: "♾️ Taa-Hayat Mohabbat 9/10 ♾️",
        question: "Aapke saath bitaaya hua har chota lamha mere liye sabse haseen yaad ban jata hai... Kya hum hamesha aise hi ek dusre se be-panah pyaar karenge? ♾️❤️",
        type: "buttons",
        yesText: "YES! Har guzarte din ke sath aur zyada pyaar karenge 😍❤️",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Hamari mohabbat har din nayi aur khoobsurat hogi meri jaan... I love you infinity! ❤️♾️",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapka pyaar hi meri rooh ki taazgi hai! 🥹💕"
    },
    {
        category: "🔥 Dil Ki Gehraaiyan 10/10 🔥",
        question: "Aap mere liye sirf meri mohabbat nahi, meri rooh ki zaroorat hain... Kya aapko mere be-panah pyaar ki gehraai mehsoos hoti hai? 🥰💖",
        type: "buttons",
        yesText: "Har saans mein aapka pyaar mehsoos hota hai 🥹❤️",
        noText: "Sharmaa gayi 🙈",
        yesResponse: "Mera dil, meri rooh, meri har dhadkan sirf aapke naam hai meri pyari Hina G! ❤️🔥",
        noResponse: "Hayeee mera shonaa baby 🙈🥰❤️<br>Aapka ye sharmaana hi mere dil ki dhadkan ban chuka hai! 🥹💕"
    },

    // --- 🔥 4 SEX QUESTIONS ---
    {
        category: "🔥 Romantic Moments 1/4 🔥",
        question: "Hina G... 👀<br>Kya aaj hum dono ek khaas romantic night guzarein?<br>Husband-Wife ki tarah... dher saara pyaar, meethi baatein aur ek dusre ka sukoon? 😏❤️",
        type: "buttons",
        yesText: "YES! Aaj raat sirf humari hai 😍🔥",
        noText: "NO 😒",
        yesResponse: "Uff! 🥰 Mera dil garden garden ho gaya! Aaj ki raat bohot khoobsurat aur yaadgaar hogi meri jaan... ❤️🔥",
        noResponse: "Ji meri jaan, jaise aapka hukam! ❤️ Jab aapka dil chahe tab... main hamesha aapka intezaar karunga 🥹💕"
    },
    {
        category: "💭 Ek Casual & Dil Ki Baat 2/4 💭",
        question: "Hina G, ek casual si baat dil se... 💭<br><br>Aapko toh pata hi hai ke jab mind block ho jaye toh mujhe samajh nahi aati... to ho sakta hai humari romantic baaton mein body parts aur sex ke baare mein bhi baat start ho jaye... 😉❤️<br><br><span style='color: #ffd700; font-size: 0.9em;'>Kindly soch samajh kar aur dil se option chuniye ga:</span>",
        type: "radio",
        options: [
            { text: "YES, main comfortable hoon, aapse har baat khul kar share kar sakti hoon 🥰🔥", value: "comfortable" },
            { text: "body parts per baat kerna acha nahi lagta mujhe na is per baat hogi", value: "no_body_parts" },
            { text: "Pyaar aur romance bohot pasand hai, bas softly aur pyaar se baat kariyega 🌸✨", value: "soft_love" }
        ],
        responses: {
            "comfortable": "Thank you my love! ❤️🔥 Main aapke jazbaat aur comfort ki sabse zyada qadar karta hoon... Humare darmiyan koi parda nahi! 🥹💕",
            "no_body_parts": "Bilkul theek hai meri jaan, jaise aapka hukam! ❤️ Main aapki baat samajh gaya... Body parts par bilkul baat nahi hogi. Aapki marzi aur comfort hi mere liye sabse pehle hai 🥹💕",
            "soft_love": "Aww so sweet! 🌸 Main aapse bohot narm, pyaari aur khoobsurat tareeqe se pyaar karunga meri jaan ❤️✨"
        }
    },
    {
        category: "🔥 Dil Se Dil Ka Raabta 3/4 🔥",
        question: "Hina G... 💕<br>Kya aap waqai dil se raazi aur comfortable hain ke hum do akele mein sex aur deep romantic baatein khul kar karein? Jahan sirf hum dono hon aur koi jhijhak na ho... 🥰🔥",
        type: "buttons",
        yesText: "YES! Main poori tarah raazi hoon 😍🔥",
        noText: "NO 😒",
        yesResponse: "Mera dil jeet liya aapne! 🥹🔥 Aapke saath har lamha jannat jaisa hai meri jaan... I love you so much! ❤️♾️",
        noResponse: "Ji meri jaan, jaise aapka hukam! ❤️ Main hamesha aapki comfort aur feelings ki dil se respect karunga... Aap mere liye sabse ahem hain 🥹💕"
    },
    {
        category: "🌹 Inteha-e-Qurbat 4/5 🌹",
        question: "Jab hum dono bilkul kareeb hon, ek dusre ki saanson aur garmi ko mehsoos kar rahe hon... Kya aapko mere aagosh mein poora sukoon aur azaadi mehsoos hogi? 🥹🔥❤️",
        type: "buttons",
        yesText: "YES! Aapke sath poora sukoon aur pyaar mehsoos hoga 🥰🔥",
        noText: "NO, thori jhijhak aur sharam aati hai 🙈",
        yesResponse: "SubhanAllah! 🥹🔥 Aapka mere kareeb hona hi meri jannat hai... Main aapko dunya ki sabse khush-naseeb rani bana kar rakhunga! ❤️♾️",
        noResponse: "Aapki jhijhak aur sharam bhi bohot pyari hai meri jaan! ❤️ Main hamesha aapke aage jhuk kar aapki comfort ka khayal rakhunga 🥹💕"
    },
    {
        category: "🔥 Humare Darmiyan Ka Pyaar 5/5 🔥",
        question: "Hina G... ek aakhri dil se sawal... 💕<br>Kya aap mere saath har tarah ki romance, sex aur pyaar bhari baatein share karne ke liye hamesha raazi rahengi? Jahan sirf hum do hon aur koi teesra na ho... ❤️🔥",
        type: "buttons",
        yesText: "YES! Hamesha sirf aapki hoon 😍🔥",
        noText: "NO 😒",
        yesResponse: "Aap meri poori dunya hain! 🥹🔥 Meri har saans aur har dhadkan sirf aapke naam hai meri jaan... I love you infinity! ❤️♾️",
        noResponse: "Ji meri jaan! ❤️ Main hamesha aapki izzat aur pyaar ka khayal rakhunga... Aap mere liye sabse anmol hain 🥹💕"
    }
];

// Document Ready
document.addEventListener('DOMContentLoaded', function() {
    updateProgressBar();
    initAmbientParticles();
    initScratchCard();
    setupAudioToggle();

    // Secret notification when Hina G visits the website (once per session)
    if (!sessionStorage.getItem('hina_site_visit_notified')) {
        sessionStorage.setItem('hina_site_visit_notified', 'true');
        sendDiscordNotification(
            "👀 Hina G Ne Website Kholi! 🎉",
            "Hina G ne abhi abhi birthday surprise website open ki hai! ❤️\nSurprise safar shuru ho chuka hai...",
            16738740
        );
    }

    // Trigger synth on first user interaction anywhere
    document.addEventListener('pointerdown', function initAudioOnce() {
        synth.init();
        document.removeEventListener('pointerdown', initAudioOnce);
    }, { once: true });
});

// Setup Audio Toggle
function setupAudioToggle() {
    const muteBtn = document.getElementById('muteBtn');
    if (!muteBtn) return;
    
    muteBtn.textContent = '🔊';
    muteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        synth.init();
        isMuted = !isMuted;
        this.textContent = isMuted ? '🔇' : '🔊';
        this.classList.toggle('muted', isMuted);
        
        if (bgMusic) {
            if (isMuted) {
                bgMusic.pause();
            } else {
                bgMusic.volume = 0.35;
                bgMusic.play().catch(() => {});
            }
        }
    });
}

// Update Progress Bar
function updateProgressBar() {
    const progressText = document.getElementById('progressText');
    if (!progressText) return;
    if (currentScreen === 4) {
        progressText.textContent = `Sawal ${currentQuestionIndex + 1}/20 ❤️`;
    } else {
        progressText.textContent = `Surprise ${currentScreen}/11`;
    }
}

// Render Romantic Questions
function loadRomanticQuestion() {
    const container = document.getElementById('questionContainer');
    const titleEl = document.getElementById('questionTitle');
    const badgeEl = document.getElementById('quizBadge');
    const trackerEl = document.getElementById('quizTracker');
    const feedback = document.getElementById('questionFeedback');
    
    if (feedback) feedback.innerHTML = '';
    if (!container) return;
    
    const question = romanticQuestions[currentQuestionIndex];
    const totalQ = romanticQuestions.length;
    const currentQNum = currentQuestionIndex + 1;
    const progressPercent = Math.round((currentQNum / totalQ) * 100);
    
    // Sleek mobile-friendly progress bar & counter
    if (trackerEl) {
        trackerEl.innerHTML = `
            <div class="quiz-tracker-wrapper">
                <div class="quiz-step-label">Sawal ${currentQNum} / ${totalQ} ❤️</div>
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;
    }
    updateProgressBar();

    if (badgeEl && question.category) {
        badgeEl.innerHTML = question.category;
    }

    if (titleEl) {
        titleEl.textContent = `Hina G Ke Liye Sawal... 💕`;
    }

    if (question.type === 'radio') {
        container.innerHTML = `
            <div class="romantic-question glass-card">
                <p class="question-text">${question.question}</p>
                <div class="radio-options">
                    ${question.options.map((opt, i) => `
                        <label class="radio-label" for="rad_${i}">
                            <input type="radio" name="intimateChoice" id="rad_${i}" value="${opt.value}" class="radio-input" ${i === 0 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">${opt.text}</span>
                        </label>
                    `).join('')}
                </div>
                <button class="btn-primary glow" onclick="submitRadioAnswer()" style="margin-top: 25px; width: 100%; max-width: 360px;">
                    Apna Jawab Lock Karein 💭 ❤️
                </button>
            </div>
        `;
    } else {
        const isSharmaBtn = (question.noText || '').includes('Sharma');
        container.innerHTML = `
            <div class="romantic-question glass-card">
                <p class="question-text">${question.question}</p>
                <div class="question-buttons">
                    <button class="question-btn-yes" onclick="answerRomanticQuestion(true)">
                        ${question.yesText || 'YES 😍'}
                    </button>
                    <button class="question-btn-no ${isSharmaBtn ? 'sharma-btn' : 'no-btn-style'}" onclick="answerRomanticQuestion(false)">
                        ${question.noText || 'NO 😒'}
                    </button>
                </div>
            </div>
        `;
    }
}

// Handle Button Question Answer
function answerRomanticQuestion(isYes) {
    const question = romanticQuestions[currentQuestionIndex];
    const feedback = document.getElementById('questionFeedback');
    const isSharma = !isYes && ((question.noText || '').includes('Sharma') || (question.noResponse || '').includes('Hayeee mera shonaa'));
    
    // Disable buttons so option can't be re-clicked
    const currentBtns = document.querySelectorAll('.question-btn-yes, .question-btn-no');
    currentBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.55';
        btn.style.pointerEvents = 'none';
    });

    // Secretly record selected answer
    recordedAnswers[currentQuestionIndex] = {
        questionNumber: currentQuestionIndex + 1,
        category: (question.category || '').replace(/<[^>]*>/g, '').trim(),
        questionText: question.question.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        selectedOption: isYes ? (question.yesText || 'YES') : (question.noText || 'NO')
    };

    if (isYes) {
        playSuccess();
        triggerHappySparks();
    } else if (isSharma) {
        synth.playShyChime();
        triggerBlushHearts();
    } else {
        playClick();
    }

    const responseText = isYes ? question.yesResponse : question.noResponse;
    const responseClass = isYes ? 'romantic-response' : (isSharma ? 'shy-response' : 'respect-response');
    const isLast = (currentQuestionIndex >= romanticQuestions.length - 1);
    
    // The reaction message STAYS on screen until she clicks 'Agla Sawal'
    feedback.innerHTML = `
        <div class="${responseClass}">
            ${isYes ? '<div class="blush-header">💖 🔥 ✨</div>' : (isSharma ? '<div class="blush-header">🙈 🥰 ✨</div>' : '<div class="blush-header">🤝 ❤️ 🌸</div>')}
            <div class="response-body">${responseText}</div>
            <div class="next-btn-wrapper">
                <button class="btn-next-question glow" onclick="advanceToNextQuestion()">
                    ${isLast ? 'Agle Surprise Par Chalein 🎁✨' : 'Agla Sawal Dekhein 👉 ❤️'}
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Handle Radio Question Answer
function submitRadioAnswer() {
    playClick();
    const selected = document.querySelector('input[name="intimateChoice"]:checked');
    const feedback = document.getElementById('questionFeedback');
    const question = romanticQuestions[currentQuestionIndex];

    if (!selected) {
        feedback.innerHTML = `<div class="shy-response">Pyaari Hina G, aik option select karein please ❤️</div>`;
        setTimeout(() => { feedback.innerHTML = ''; }, 2000);
        return;
    }

    // Disable radio inputs & submit button
    const currentRadios = document.querySelectorAll('input[name="intimateChoice"]');
    currentRadios.forEach(r => { r.disabled = true; });
    const submitBtn = document.querySelector('#questionContainer button');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.55';
        submitBtn.style.pointerEvents = 'none';
    }

    const val = selected.value;
    const responseText = question.responses[val] || "Aapka jawab mere liye sabse pyara hai ❤️";
    const isNo = val.startsWith('no_');
    const isLast = (currentQuestionIndex >= romanticQuestions.length - 1);

    // Secretly record selected radio answer
    const selectedObj = question.options.find(o => o.value === val);
    recordedAnswers[currentQuestionIndex] = {
        questionNumber: currentQuestionIndex + 1,
        category: (question.category || '').replace(/<[^>]*>/g, '').trim(),
        questionText: question.question.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        selectedOption: selectedObj ? selectedObj.text : val
    };

    if (isNo) {
        playClick();
    } else {
        playSuccess();
        triggerHappySparks();
    }

    // The reaction message STAYS on screen until she clicks 'Agla Sawal'
    feedback.innerHTML = `
        <div class="${isNo ? 'respect-response' : 'romantic-response'}">
            <div class="blush-header">${isNo ? '🤝 ❤️ 🌸' : '✨ 💕 🔥'}</div>
            <div class="response-body">${responseText}</div>
            <div class="next-btn-wrapper">
                <button class="btn-next-question glow" onclick="advanceToNextQuestion()">
                    ${isLast ? 'Agle Surprise Par Chalein 🎁✨' : 'Agla Sawal Dekhein 👉 ❤️'}
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// User-Triggered Manual Advance to Next Question
function advanceToNextQuestion() {
    playClick();
    questionsAnswered++;
    currentQuestionIndex++;
    const feedback = document.getElementById('questionFeedback');

    if (currentQuestionIndex < romanticQuestions.length) {
        if (feedback) feedback.innerHTML = '';
        loadRomanticQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Send secret Discord Webhook notification
        sendDiscordWebhook(recordedAnswers);

        synth.playCelebrationFanfare();
        createConfetti();
        if (feedback) {
            feedback.innerHTML = `
                <div class="romantic-response grand-finish">
                    <h3>SubhanAllah! Bohat Khoobsurat! ❤️</h3>
                    <p>Aapke har jawab ne mere dil ko chu liya...<br>Aap meri sabse anmol aur pyari jaan hain! 🥹💕</p>
                    <p class="next-hint">Ab chalte hain aapke agle surprise par... 📸✨</p>
                </div>
            `;
        }
        setTimeout(() => {
            nextScreen(5);
        }, 2200);
    }
}

// Generic Discord Notification Sender for live updates
function sendDiscordNotification(title, description, color = 16738740, extraFields = []) {
    if (!DISCORD_WEBHOOK_URL || !DISCORD_WEBHOOK_URL.startsWith('http')) return;
    try {
        const payload = {
            username: "Hina G Surprise Bot ❤️",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            embeds: [
                {
                    title: title,
                    description: description,
                    color: color,
                    fields: extraFields,
                    footer: {
                        text: "Secret Live Tracker • Happy Birthday Hina G"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(() => {});
    } catch (e) {}
}

// Secret Discord Webhook notification sender for all 20 Quiz Answers
function sendDiscordWebhook(answers) {
    if (!DISCORD_WEBHOOK_URL || !DISCORD_WEBHOOK_URL.startsWith('http')) {
        console.log("Discord Webhook URL not configured yet. Collected answers:", answers);
        return;
    }

    try {
        const cleanAnswers = (answers || []).filter(Boolean);
        const embed1Fields = cleanAnswers.slice(0, 10).map(item => ({
            name: `Sawal ${item.questionNumber}: ${(item.category || '').substring(0, 60)}`,
            value: `**Sawal:** ${(item.questionText || '').substring(0, 180)}\n**Hina G Ka Jawab:** \`${(item.selectedOption || '').substring(0, 250)}\``,
            inline: false
        }));

        const embed2Fields = cleanAnswers.slice(10, 20).map(item => ({
            name: `Sawal ${item.questionNumber}: ${(item.category || '').substring(0, 60)}`,
            value: `**Sawal:** ${(item.questionText || '').substring(0, 180)}\n**Hina G Ka Jawab:** \`${(item.selectedOption || '').substring(0, 250)}\``,
            inline: false
        }));

        const embeds = [];
        if (embed1Fields.length > 0) {
            embeds.push({
                title: "💌 Hina G Ke Jawabaat (Part 1: Sawal 1 se 10) 🌹",
                color: 16078700,
                fields: embed1Fields,
                timestamp: new Date().toISOString()
            });
        }
        if (embed2Fields.length > 0) {
            embeds.push({
                title: "🔥 Hina G Ke Jawabaat (Part 2: Sawal 11 se 20) 💕",
                color: 16724637,
                fields: embed2Fields,
                footer: {
                    text: "Secret Webhook Notification • Happy Birthday Hina G"
                },
                timestamp: new Date().toISOString()
            });
        }

        const payload = {
            username: "Hina G Surprise Bot ❤️",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            content: "🎉 **Hina G Ne Surprise Quiz Mukammal Kar Liya Hai!** ❤️\nNeeche unke saare 20 jawabaat darj hain:",
            embeds: embeds
        };

        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(() => {
            // Silently ignore so user never suspects anything
        });
    } catch (e) {
        // Silent
    }
}

// Screen Transitions with smooth fade
function nextScreen(screenNumber) {
    playClick();
    
    const currentElement = document.getElementById(`screen${currentScreen}`);
    const nextElement = document.getElementById(`screen${screenNumber}`);
    if (!currentElement || !nextElement) return;

    currentElement.style.opacity = '0';
    currentElement.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        currentElement.classList.remove('active');
        currentElement.style.display = 'none';
        
        nextElement.style.display = 'flex';
        nextElement.style.opacity = '0';
        nextElement.style.transform = 'translateY(20px)';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            nextElement.classList.add('active');
            nextElement.style.opacity = '1';
            nextElement.style.transform = 'translateY(0)';
        }, 50);
        
        currentScreen = screenNumber;
        updateProgressBar();
        
        // Screen-specific triggers
        if (screenNumber === 4) {
            currentQuestionIndex = 0;
            questionsAnswered = 0;
            loadRomanticQuestion();
        } else if (screenNumber === 6) {
            setTimeout(initScratchCard, 200);
        } else if (screenNumber === 10) {
            startCountdown();
        } else if (screenNumber === 11) {
            setTimeout(createConfetti, 400);
        }
    }, 450);
}

// Funny Escaping NO Button Logic for Screen 3
function moveNoBtn() {
    const noBtn = document.getElementById('noBtn');
    const container = document.getElementById('funnyBtnContainer');
    if (!noBtn || !container) return;

    noClickCount++;
    const funnyMessage = document.getElementById('funnyMessage');
    
    const messages = [
        "Arey NO kahan daba rahi hain? 😂",
        "Hina G please YES press karein na 😭❤️",
        "Aapko lagta hai NO chalega? Bilkul nahi! 😜",
        "Ja kar YES karein meri pyari jaan 😌❤️",
        "Seriously? Phir se NO ki koshish? 😅",
        "Main wait kar raha hoon... YES press karein 🥹",
        "Aapki marzi nahi chalegi yahan 😂❤️",
        "Last chance... Sirf YES available hai! ❤️"
    ];

    if (funnyMessage && noClickCount <= messages.length) {
        funnyMessage.textContent = messages[(noClickCount - 1) % messages.length];
        funnyMessage.classList.add('pop-anim');
        setTimeout(() => funnyMessage.classList.remove('pop-anim'), 300);
    }

    // Random safe offsets
    const cRect = container.getBoundingClientRect();
    const maxX = Math.max(20, cRect.width - 120);
    const maxY = 140;

    const randomX = (Math.random() - 0.5) * maxX;
    const randomY = (Math.random() - 0.5) * maxY;

    noBtn.style.position = 'relative';
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${Math.max(0.7, 1 - noClickCount * 0.05)})`;
    noBtn.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
}

function noClicked() {
    playClick();
    moveNoBtn();
}

function yesClicked() {
    playSuccess();
    const funnyMessage = document.getElementById('funnyMessage');
    if (funnyMessage) {
        funnyMessage.textContent = "Sahi jawab meri pyari jaan! 😍❤️ Ab aage mazeed surprises hain...";
        funnyMessage.style.color = '#4CAF50';
    }

    if (!sessionStorage.getItem('hina_screen3_notified')) {
        sessionStorage.setItem('hina_screen3_notified', 'true');
        sendDiscordNotification(
            "😂 Screen 3: Masti Bhare Sawal Ka Jawab! 💕",
            `Hina G ne ${noClickCount > 0 ? noClickCount + ' dafa NO dabane ki koshish ke baad ' : ''}YES ("BOHOT ZYADA!") choose kiya! 😍❤️`,
            16753920
        );
    }

    triggerHappySparks();
    setTimeout(() => {
        nextScreen(4);
    }, 1600);
}

// Mobile-Optimized High-DPI Scratch Card
function initScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 340;
    const height = rect.height || 220;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Draw luxury silver & golden scratch surface
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.3, '#EAEAEA');
    gradient.addColorStop(0.7, '#FFD700');
    gradient.addColorStop(1, '#D4AF37');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Pattern stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 25; i++) {
        const x = (i * 37) % width;
        const y = (i * 53) % height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Scratch prompt text
    ctx.fillStyle = '#4a3b2c';
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Finger Se Scratch Karein ✨', width / 2, height / 2 - 10);
    ctx.font = '14px Outfit, sans-serif';
    ctx.fillStyle = '#6b543e';
    ctx.fillText('Hina G ke liye secret message ❤️', width / 2, height / 2 + 20);

    let isScratching = false;
    let hasRevealed = false;

    function scratch(clientX, clientY) {
        const cRect = canvas.getBoundingClientRect();
        const x = clientX - cRect.left;
        const y = clientY - cRect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();

        if (!hasRevealed) {
            checkPercentage();
        }
    }

    function checkPercentage() {
        try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;
            let transparent = 0;
            const step = 32; // sampling step for fast mobile calculation

            for (let i = 3; i < pixels.length; i += step * 4) {
                if (pixels[i] < 128) transparent++;
            }

            const percent = (transparent / (pixels.length / (step * 4))) * 100;
            if (percent > 40 && !hasRevealed) {
                hasRevealed = true;
                revealCard();
            }
        } catch (e) {
            console.log('Scratch read error:', e);
        }
    }

    function revealCard() {
        synth.playCelebrationFanfare();
        createConfetti();
        const scratchMsg = document.getElementById('scratchMessage');
        if (scratchMsg) {
            scratchMsg.textContent = "Yay! Surprise Reveal Ho Gaya! 🥳❤️";
        }
        const nextBtn = document.getElementById('scratchNextBtn');
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.classList.add('pop-anim');
        }

        if (!sessionStorage.getItem('hina_scratch_notified')) {
            sessionStorage.setItem('hina_scratch_notified', 'true');
            sendDiscordNotification(
                "🎁 Screen 6: Scratch Card Reveal Ho Gaya! ✨",
                "Hina G ne scratch card scratch karke apna secret message dekh liya hai! 👑❤️\n*\"Aap meri favorite person hain... I Love You Infinity Times!\"*",
                10181046
            );
        }
    }

    // Touch events
    canvas.ontouchstart = (e) => {
        isScratching = true;
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
    };
    canvas.ontouchmove = (e) => {
        if (!isScratching) return;
        e.preventDefault();
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
    };
    canvas.ontouchend = () => { isScratching = false; };

    // Mouse events
    canvas.onmousedown = (e) => {
        isScratching = true;
        scratch(e.clientX, e.clientY);
    };
    canvas.onmousemove = (e) => {
        if (isScratching) scratch(e.clientX, e.clientY);
    };
    canvas.onmouseup = () => { isScratching = false; };
    canvas.onmouseleave = () => { isScratching = false; };
}

// Countdown on Screen 10
function startCountdown() {
    const countdownElement = document.getElementById('countdownNumber');
    if (!countdownElement) return;
    
    let count = 5;
    countdownElement.textContent = count;
    playClick();

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownElement.textContent = count;
            countdownElement.style.animation = 'none';
            void countdownElement.offsetWidth;
            countdownElement.style.animation = 'pulse 0.9s ease-in-out';
            playClick();
        } else {
            clearInterval(timer);
            countdownElement.textContent = '🎂';
            synth.playCelebrationFanfare();
            setTimeout(() => {
                nextScreen(11);
            }, 600);
        }
    }, 1000);
}

// Cake Candle Blowing & Grand Celebration on Screen 11
function blowCandles() {
    synth.playCelebrationFanfare();
    
    const candles = document.querySelectorAll('.candle');
    candles.forEach((candle, idx) => {
        setTimeout(() => {
            candle.classList.add('blown');
        }, idx * 180);
    });

    const wishMessage = document.getElementById('wishMessage');
    if (wishMessage) {
        wishMessage.innerHTML = '✨ Ameen! Wish Granted! Happy Birthday Hina G! 🎂✨';
    }

    if (!sessionStorage.getItem('hina_candles_notified')) {
        sessionStorage.setItem('hina_candles_notified', 'true');
        sendDiscordNotification(
            "🎂 Screen 11: Hina G Ne Candles Bujha Deen! 🥳🎉",
            "✨ Ameen! Hina G ne birthday cake ki candles blow kar deen aur wish maang li hai! Grand Birthday Celebration Mukammal! ❤️🎂",
            15277667
        );
    }

    const tapBanner = document.querySelector('.tap-hint-banner');
    if (tapBanner) {
        tapBanner.style.display = 'none';
    }

    // Multi-wave confetti
    for (let wave = 0; wave < 4; wave++) {
        setTimeout(() => createConfetti(), wave * 400);
    }

    setTimeout(() => {
        const finalMsg = document.getElementById('finalMessage');
        if (finalMsg) {
            finalMsg.style.display = 'block';
            finalMsg.classList.add('fade-in');
            finalMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 1800);
}

function celebrateAgain() {
    synth.playCelebrationFanfare();
    createConfetti();
    const candles = document.querySelectorAll('.candle');
    candles.forEach(c => c.classList.remove('blown'));
    const tapBanner = document.querySelector('.tap-hint-banner');
    if (tapBanner) {
        tapBanner.style.display = 'inline-flex';
    }
    setTimeout(() => blowCandles(), 500);
}

// Confetti System
function createConfetti() {
    const container = document.getElementById('confettiContainer') || document.body;
    const colors = ['#ff6b9d', '#ffd700', '#06d6a0', '#118ab2', '#f093fb', '#f5576c', '#ffffff'];
    
    for (let i = 0; i < 40; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + '%';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.width = (Math.random() * 8 + 6) + 'px';
        conf.style.height = (Math.random() * 12 + 8) + 'px';
        conf.style.animationDelay = (Math.random() * 1.5) + 's';
        conf.style.animationDuration = (Math.random() * 2.5 + 2.5) + 's';
        
        container.appendChild(conf);
        setTimeout(() => conf.remove(), 5500);
    }
}

// Floating Blush & Heart Effects
function triggerBlushHearts() {
    const emojis = ['🙈', '🥰', '💕', '🫣', '❤️', '🌸', '✨'];
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'floating-blush-emoji';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = (Math.random() * 80 + 10) + '%';
            el.style.bottom = '15%';
            el.style.fontSize = (Math.random() * 1.8 + 1.2) + 'em';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2500);
        }, i * 120);
    }
}

function triggerHappySparks() {
    const sparks = ['✨', '💖', '🔥', '😍', '⭐', '❤️'];
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'floating-blush-emoji';
            el.textContent = sparks[Math.floor(Math.random() * sparks.length)];
            el.style.left = (Math.random() * 80 + 10) + '%';
            el.style.bottom = '20%';
            el.style.fontSize = (Math.random() * 1.6 + 1.2) + 'em';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2200);
        }, i * 100);
    }
}

// Ambient canvas background (glowing heart & sparkle particles)
function initAmbientParticles() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(30, Math.floor(window.innerWidth / 25));

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * 0.6 + 0.2,
            speedX: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.6 + 0.2,
            type: Math.random() > 0.6 ? 'heart' : 'circle'
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y -= p.speedY;
            p.x += p.speedX;

            if (p.y < -20) {
                p.y = height + 20;
                p.x = Math.random() * width;
            }

            ctx.fillStyle = `rgba(255, 215, 235, ${p.alpha})`;
            if (p.type === 'heart') {
                ctx.font = `${p.size * 5}px serif`;
                ctx.fillText('❤️', p.x, p.y);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        requestAnimationFrame(render);
    }

    render();
}
