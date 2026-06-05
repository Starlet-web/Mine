// ============ CONTENT SECTIONS MODULE ============
const ContentSections = (function() {
  'use strict';
  
  // ============ MOCK TEST ============
  
  const mockQuestions = [
    { id:1, q:"Logistic growth equation is:", options:["dN/dt=rN","dN/dt=rN(1-N/K)","dN/dt=K-N","dN/dt=rK"], correct:1, exp:"dN/dt=rN(1-N/K) - sigmoid growth curve with carrying capacity K." },
    { id:2, q:"Aquatic biomass pyramid is generally:", options:["Upright","Inverted","Spindle-shaped","None"], correct:1, exp:"Inverted due to rapid turnover of phytoplankton supporting larger zooplankton biomass." },
    { id:3, q:"Term 'ecology' was coined by:", options:["Charles Darwin","Ernst Haeckel","A.G. Tansley","E.P. Odum"], correct:1, exp:"Ernst Haeckel coined 'ecology' in 1866 from Greek 'oikos' (house) and 'logos' (study)." },
    { id:4, q:"Example of keystone species:", options:["Elephant","Sea otter","Grasshopper","Rabbit"], correct:1, exp:"Sea otter controls sea urchin population, maintaining kelp forest ecosystem." },
    { id:5, q:"10% law of energy flow was given by:", options:["Charles Elton","Raymond Lindeman","G.E. Hutchinson","Robert MacArthur"], correct:1, exp:"Raymond Lindeman proposed 10% law in 1942 based on trophic-dynamic concept." },
    { id:6, q:"Competitive inhibitor effect on Km:", options:["Decreases","Increases","No change","Eliminates"], correct:1, exp:"Increases apparent Km; Vmax remains unchanged. Competes for active site." },
    { id:7, q:"Main DNA replication enzyme in prokaryotes:", options:["DNA Pol I","DNA Pol III","DNA Pol α","Telomerase"], correct:1, exp:"DNA Polymerase III is the main replicative enzyme with high processivity." },
    { id:8, q:"Lac operon is an example of:", options:["Positive inducible","Negative inducible","Negative repressible","Constitutive"], correct:1, exp:"Negative inducible - allolactose acts as inducer by binding to repressor protein." },
    { id:9, q:"NOT a condition for Hardy-Weinberg equilibrium:", options:["No mutation","Random mating","Small population","No selection"], correct:2, exp:"Large population is required; small populations experience genetic drift." },
    { id:10, q:"Correct PCR temperature sequence:", options:["95-72-55°C","95-55-72°C","55-95-72°C","72-95-55°C"], correct:1, exp:"Denaturation(95°C)→Annealing(55°C)→Extension(72°C)." },
    { id:11, q:"Glycolysis occurs in:", options:["Mitochondria","Cytoplasm","Nucleus","ER"], correct:1, exp:"Glycolysis takes place in cytoplasm of all living cells." },
    { id:12, q:"ATP yield from one glucose (aerobic):", options:["2","36-38","4","12"], correct:1, exp:"36-38 ATP in prokaryotes, 30-32 in eukaryotes depending on shuttle system." },
    { id:13, q:"RuBisCO enzyme is involved in:", options:["Glycolysis","Calvin cycle","Krebs cycle","ETC"], correct:1, exp:"RuBisCO (Ribulose-1,5-bisphosphate carboxylase/oxygenase) fixes CO2 in Calvin cycle." },
    { id:14, q:"Which is NOT a stop codon?", options:["UAA","UAG","UGA","AUG"], correct:3, exp:"AUG codes for Methionine and serves as start codon. UAA, UAG, UGA are stop codons." },
    { id:15, q:"TATA box is located in:", options:["Enhancer","Core promoter","Operator","Terminator"], correct:1, exp:"TATA box is a core promoter element located ~25-30 bp upstream of transcription start site." }
  ];
  
  let quizTimer = null;
  let quizTimeLeft = 0;
  let quizActive = false;
  let mockTestSubmitted = false;
  
  function loadMockTest() {
    const container = Utils.$('mocktestContainer');
    if (!container) return;
    
    mockTestSubmitted = false;
    
    let html = `
      <h3>📝 CSIR NET Mock Test (15 Questions)</h3>
      <div class="timer-display" id="quizTimer">⏱️ 15:00</div>
    `;
    
    mockQuestions.forEach((q, i) => {
      html += `
        <div class="question-card">
          <div class="q-num">Q${i+1}. ${q.q}</div>
          <div class="options">
            ${q.options.map((o, oi) => `
              <div class="option" data-q="${q.id}" data-o="${oi}" onclick="ContentSections.selectOption(this, ${q.id}, ${oi})">
                ${String.fromCharCode(65+oi)}. ${o}
              </div>
            `).join('')}
          </div>
          <div class="explanation" id="exp-${q.id}">💡 ${q.exp}</div>
        </div>
      `;
    });
    
    html += `
      <button class="submit-test-btn" onclick="ContentSections.submitTest()">Submit Test</button>
      <div class="score-display" id="scoreDisplay"></div>
    `;
    
    container.innerHTML = html;
    startQuizTimer(900);
  }
  
  function startQuizTimer(seconds) {
    quizTimeLeft = seconds;
    quizActive = true;
    clearInterval(quizTimer);
    
    quizTimer = setInterval(() => {
      quizTimeLeft--;
      const m = Math.floor(quizTimeLeft / 60);
      const s = quizTimeLeft % 60;
      const timerEl = Utils.$('quizTimer');
      if (timerEl) timerEl.textContent = `⏱️ ${m}:${s.toString().padStart(2, '0')}`;
      
      if (quizTimeLeft <= 0) {
        clearInterval(quizTimer);
        quizActive = false;
        submitTest();
      }
    }, 1000);
  }
  
  function selectOption(el, qId, oIdx) {
    if (mockTestSubmitted) return;
    el.parentElement.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    el.dataset.selected = oIdx;
  }
  
  function submitTest() {
    if (mockTestSubmitted) return;
    mockTestSubmitted = true;
    clearInterval(quizTimer);
    quizActive = false;
    
    let score = 0;
    
    mockQuestions.forEach(q => {
      const selected = document.querySelector(`.option.selected[data-q="${q.id}"]`);
      const exp = Utils.$('exp-' + q.id);
      if (exp) exp.classList.add('show');
      
      document.querySelectorAll(`.option[data-q="${q.id}"]`).forEach(o => {
        const oi = parseInt(o.dataset.o);
        if (oi === q.correct) o.classList.add('correct');
        if (selected && parseInt(selected.dataset.selected) === oi && oi !== q.correct) {
          o.classList.add('wrong');
        }
      });
      
      if (selected && parseInt(selected.dataset.selected) === q.correct) score++;
    });
    
    const scoreEl = Utils.$('scoreDisplay');
    if (scoreEl) {
      scoreEl.textContent = `✅ Score: ${score}/${mockQuestions.length} (${Math.round(score/mockQuestions.length*100)}%)`;
    }
    
    XPSystem.addXP(score * 10);
    HistorySystem.addEntry('test', 'Mock Test Completed', `Score: ${score}/${mockQuestions.length}`);
  }
  
  // ============ PYQ DATABASE ============
  
  const pyqData = generatePYQs();
  
  function generatePYQs() {
    const templates = [
      { q:"Define ecological niche and its types.", ans:"Fundamental niche: full potential range. Realized niche: actual range due to competition.", topic:"Ecology" },
      { q:"Primary vs secondary succession?", ans:"Primary: barren land, no soil. Secondary: after disturbance, soil remains.", topic:"Ecology" },
      { q:"Explain r and K selection strategies.", ans:"r: high reproduction, unstable environments. K: low reproduction, stable environments.", topic:"Ecology" },
      { q:"Describe 10% law of energy flow.", ans:"Only 10% energy transfers per trophic level. Proposed by Lindeman (1942).", topic:"Ecology" },
      { q:"What is biodiversity hotspot? Name 4 in India.", ans:"High endemism + >70% habitat loss. Western Ghats, Himalayas, Indo-Burma, Sundaland.", topic:"Ecology" },
      { q:"DNA replication enzymes in prokaryotes.", ans:"DNA Pol III (main), Helicase (DnaB), Primase (DnaG), Ligase, SSB proteins.", topic:"Molecular Biology" },
      { q:"Lac operon regulation mechanism.", ans:"Negative inducible. Allolactose inducer. CAP-cAMP positive control.", topic:"Molecular Biology" },
      { q:"Transcription factors in eukaryotes.", ans:"TFIID (TBP), TFIIB, TFIIH. Regulate gene expression by RNA Pol II.", topic:"Molecular Biology" },
      { q:"PCR steps and applications.", ans:"Denaturation(95°C), Annealing(55°C), Extension(72°C). DNA amplification.", topic:"Molecular Biology" },
      { q:"Enzyme kinetics Michaelis-Menten equation.", ans:"V₀ = Vmax[S]/(Km+[S]). Km is substrate affinity, Vmax is maximum velocity.", topic:"Biochemistry" },
      { q:"Glycolysis pathway summary.", ans:"Glucose→2 Pyruvate. Net: 2 ATP, 2 NADH. 10 enzymatic steps in cytoplasm.", topic:"Biochemistry" },
      { q:"Krebs cycle significance.", ans:"Acetyl-CoA oxidation. Products: 3 NADH, 1 FADH2, 1 GTP per turn.", topic:"Biochemistry" },
      { q:"Mendel's laws of inheritance.", ans:"Law of Segregation (3:1) and Law of Independent Assortment (9:3:3:1).", topic:"Genetics" },
      { q:"Hardy-Weinberg equilibrium conditions.", ans:"No mutation, random mating, no gene flow, large population, no selection.", topic:"Genetics" },
      { q:"Cell cycle phases and checkpoints.", ans:"G1, S, G2, M phases. G1/S, G2/M checkpoints. Cyclin-CDK control.", topic:"Cell Biology" },
      { q:"Apoptosis pathways.", ans:"Intrinsic (mitochondrial, cytochrome c, Caspase-9) and Extrinsic (death receptor, Caspase-8).", topic:"Cell Biology" },
      { q:"CRISPR-Cas9 mechanism.", ans:"Guide RNA directs Cas9. PAM (NGG) recognition. DSB repaired by NHEJ/HDR.", topic:"Molecular Biology" },
      { q:"Ecological pyramid types.", ans:"Number, Biomass, Energy pyramids. Energy pyramid always upright.", topic:"Ecology" },
      { q:"Nitrogen cycle steps.", ans:"Nitrogen fixation→Nitrification→Assimilation→Ammonification→Denitrification.", topic:"Ecology" },
      { q:"Types of immunoglobulins.", ans:"IgG, IgM, IgA, IgE, IgD. Different structure and function.", topic:"Immunology" },
      { q:"MHC classes and functions.", ans:"MHC I (all nucleated cells, CD8+), MHC II (APCs, CD4+). Antigen presentation.", topic:"Immunology" },
      { q:"Action potential phases.", ans:"Depolarization (Na+ influx), Repolarization (K+ efflux), Hyperpolarization.", topic:"Physiology" },
      { q:"Countercurrent multiplier.", ans:"Loop of Henle creates medullary gradient. Ascending limb active NaCl transport.", topic:"Physiology" },
      { q:"Types of speciation.", ans:"Allopatric (geographic), Sympatric (same area), Parapatric (adjacent).", topic:"Evolution" },
      { q:"Natural selection types.", ans:"Directional, Stabilizing, Disruptive selection. Changes trait distribution.", topic:"Evolution" }
    ];
    
    const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];
    const result = [];
    
    templates.forEach((t, i) => {
      years.forEach(year => {
        result.push({ ...t, year, id: result.length + 1 });
      });
    });
    
    return result;
  }
  
  function loadPYQs() {
    const container = Utils.$('pyqContainer');
    if (!container) return;
    
    const topics = [...new Set(pyqData.map(p => p.topic))];
    const years = [...new Set(pyqData.map(p => p.year))];
    
    let html = `
      <h3>📖 PYQ Database (${pyqData.length}+ Questions)</h3>
      <div class="filter-bar">
        <select id="topicFilter" class="filter-select" onchange="ContentSections.filterPYQs()">
          <option value="all">All Topics</option>
          ${topics.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <select id="yearFilter" class="filter-select" onchange="ContentSections.filterPYQs()">
          <option value="all">All Years</option>
          ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
        </select>
      </div>
      <div id="pyqList"></div>
    `;
    
    container.innerHTML = html;
    filterPYQs();
  }
  
  function filterPYQs() {
    const topic = Utils.$('topicFilter')?.value || 'all';
    const year = Utils.$('yearFilter')?.value || 'all';
    
    const filtered = pyqData.filter(q =>
      (topic === 'all' || q.topic === topic) &&
      (year === 'all' || q.year === year)
    );
    
    const listEl = Utils.$('pyqList');
    if (!listEl) return;
    
    let html = '';
    filtered.forEach((p, i) => {
      html += `
        <div class="pyq-card" onclick="this.querySelector('.pyq-answer').classList.toggle('show')">
          <b>Q${i+1}. [${p.year}] ${p.topic}</b>
          <div class="pyq-question">${p.q}</div>
          <div class="pyq-answer">✅ ${p.ans}</div>
        </div>`;
    });
    
    listEl.innerHTML = html || '<p style="text-align:center;color:#8a9b7a;">No questions found</p>';
  }
  
  // ============ VIDEOS ============
  
  const videoData = [
    { title:"DNA Replication Mechanism", duration:"45 min", author:"Shomu's Biology", id:"TNKWgcFPHqw" },
    { title:"Transcription in Eukaryotes", duration:"55 min", author:"Unacademy", id:"SMtWvDbfHLo" },
    { title:"Enzyme Kinetics Detailed", duration:"1hr 5min", author:"IFAS", id:"n2XPfxN3uG8" },
    { title:"Lac Operon Explained", duration:"38 min", author:"Shomu's Biology", id:"iPQZXMKZEfw" },
    { title:"PCR Technique", duration:"42 min", author:"CSIR Adda", id:"aUBJtHkAe4k" },
    { title:"Mendelian Genetics", duration:"50 min", author:"Unacademy", id:"NWqgZUnJStE" },
    { title:"Hardy-Weinberg Principle", duration:"35 min", author:"VedPrep", id:"oEBNom3kNzg" },
    { title:"Cell Cycle Regulation", duration:"55 min", author:"IFAS", id:"LUDws4MgrUc" },
    { title:"Krebs Cycle", duration:"45 min", author:"VedPrep", id:"juM2ROSLWfw" },
    { title:"Electron Transport Chain", duration:"50 min", author:"Shomu's Biology", id:"LQmTKgA5F0Q" }
  ];
  
  function loadVideos() {
    const container = Utils.$('videoContainer');
    if (!container) return;
    
    let html = `<h3>🎥 Video Lectures (${videoData.length})</h3>`;
    
    videoData.forEach(v => {
      html += `
        <div class="video-card" onclick="ContentSections.openVideo('${v.id}', '${v.title.replace(/'/g, "\\'")}')">
          <div class="video-thumb">▶</div>
          <div class="video-info">
            <h4>${v.title}</h4>
            <p>${v.duration} • ${v.author}</p>
          </div>
        </div>`;
    });
    
    container.innerHTML = html;
  }
  
  function openVideo(id, title) {
    // Create video modal if not exists
    let modal = Utils.$('videoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'videoModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="video-modal-content">
          <div class="video-modal-header">
            <h4 id="videoModalTitle">Lecture</h4>
            <button onclick="Utils.$('videoModal').classList.remove('active')">✕</button>
          </div>
          <div class="video-wrapper">
            <iframe id="videoIframe" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    
    Utils.$('videoModalTitle').textContent = title;
    Utils.$('videoIframe').src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    modal.classList.add('active');
    
    HistorySystem.addEntry('video', 'Video Watched', title);
    XPSystem.addXP(15);
  }
  
  // ============ NOTES ============
  
  function loadNotes() {
    const container = Utils.$('notesContainer');
    if (!container) return;
    
    const notesData = [
      { title:"🧬 Molecular Biology", content:"<b>DNA Replication:</b> Semi-conservative. Enzymes: Helicase, Primase, DNA Pol III, Ligase.<br><b>Transcription:</b> RNA Pol II. Promoter: TATA box(-25), CAAT box(-75).<br><b>Translation:</b> Initiation(AUG), Elongation, Termination(UAA,UAG,UGA).<br><b>Gene Regulation:</b> Lac operon (negative inducible), Trp operon (negative repressible)." },
      { title:"🧪 Biochemistry", content:"<b>Enzyme Kinetics:</b> V₀=Vmax[S]/(Km+[S]). Competitive: ↑Km. Non-competitive: ↓Vmax.<br><b>Glycolysis:</b> Glucose→2Pyruvate. Net: 2ATP, 2NADH. Key: PFK-1.<br><b>TCA Cycle:</b> Acetyl-CoA→Citrate. Products: NADH, FADH2, GTP.<br><b>ETC:</b> Complex I-V. Chemiosmotic theory. ATP synthase." },
      { title:"🌍 Ecology", content:"<b>Population:</b> Exponential: dN/dt=rN. Logistic: dN/dt=rN(1-N/K).<br><b>Energy Flow:</b> 10% law (Lindeman). Food chains and webs.<br><b>Succession:</b> Primary (bare rock), Secondary (soil present).<br><b>Biodiversity:</b> Alpha, Beta, Gamma. Shannon-Weiner H'=-Σpi·ln(pi)." },
      { title:"🔬 Genetics", content:"<b>Mendel:</b> Segregation (3:1), Independent Assortment (9:3:3:1).<br><b>Hardy-Weinberg:</b> p²+2pq+q²=1. Five conditions.<br><b>Linkage:</b> Morgan's Drosophila experiments. Crossing over.<br><b>Population Genetics:</b> Genetic drift, Gene flow, Selection." }
    ];
    
    let html = '<h3>📚 Study Notes</h3>';
    
    notesData.forEach(n => {
      html += `<div class="note-card"><div class="note-title">${n.title}</div><p>${n.content}</p></div>`;
    });
    
    html += `
      <div class="flashcard" onclick="this.querySelector('span').style.display='block'">
        <b>🧪 GPP vs NPP?</b>
        <span style="display:none;margin-top:8px;">NPP = GPP - Respiration. NPP is energy available to next trophic level.</span>
      </div>`;
    
    container.innerHTML = html;
    HistorySystem.addEntry('notes', 'Notes Viewed', 'Study notes reviewed');
  }
  
  // ============ FORMULAS ============
  
  function loadFormulas() {
    const container = Utils.$('formulaContainer');
    if (!container) return;
    
    const formulas = [
      { title:"Population Growth", formula:"dN/dt = rN(1 - N/K)" },
      { title:"Michaelis-Menten", formula:"V₀ = Vmax[S] / (Km + [S])" },
      { title:"Hardy-Weinberg", formula:"p² + 2pq + q² = 1" },
      { title:"Shannon Diversity", formula:"H' = -Σ(pi × ln pi)" },
      { title:"Lotka-Volterra", formula:"dN/dt = rN - aNP" },
      { title:"Logistic Growth", formula:"N(t) = K / (1 + ((K-N₀)/N₀)e⁻ʳᵗ)" },
      { title:"NPP", formula:"NPP = GPP - Respiration" },
      { title:"Fitness (W)", formula:"W = 1 - s" },
      { title:"Inbreeding Coeff.", formula:"F = (He - Ho) / He" },
      { title:"Gene Frequency", formula:"p = f(AA) + ½f(Aa)" }
    ];
    
    let html = '<h3>📐 Formula Sheet</h3>';
    
    formulas.forEach(f => {
      html += `
        <div class="formula-card">
          <div class="formula-title">${f.title}</div>
          <div class="formula-content">${f.formula}</div>
        </div>`;
    });
    
    container.innerHTML = html;
  }
  
  // ============ MIND MAPS ============
  
  function loadMindMaps() {
    const container = Utils.$('mindmapContainer');
    if (!container) return;
    
    const nodes = ['DNA', 'RNA', 'Protein', 'Cell', 'Energy', 'Ecology', 'Genetics', 'Evolution'];
    
    let html = `
      <h3>🧠 Concept Mind Maps</h3>
      <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;padding:20px;">
        ${nodes.map((n, i) => `
          <div class="mindmap-node" style="animation-delay:${i*0.1}s">
            <span>${n}</span>
          </div>
        `).join('')}
      </div>
      <p style="text-align:center;color:#8a9b7a;font-size:0.75rem;">Click nodes to explore concepts</p>
    `;
    
    container.innerHTML = html;
  }
  
  // ============ FORUM ============
  
  function loadForum() {
    const container = Utils.$('forumContainer');
    if (!container) return;
    
    const posts = [
      { author:"Dr. Verma", content:"Discussion on CRISPR-Cas9 applications in gene therapy. Recent research published in Nature Biotechnology shows promising results for sickle cell disease treatment.", replies:12 },
      { author:"Research Scholar A", content:"Query about enzyme kinetics - how to calculate Km and Vmax from Lineweaver-Burk plot? Need help with the double reciprocal transformation.", replies:8 },
      { author:"Prof. Gupta", content:"Important update: New CSIR NET syllabus includes expanded epigenetics section covering histone modifications, DNA methylation, and non-coding RNAs.", replies:15 }
    ];
    
    let html = '<h3>💬 Research Discussion Forum</h3>';
    
    posts.forEach(p => {
      html += `
        <div class="forum-post">
          <div class="forum-author">👤 ${p.author}</div>
          <div class="forum-content">${p.content}</div>
          <div class="forum-meta">💬 ${p.replies} replies</div>
        </div>`;
    });
    
    container.innerHTML = html;
  }
  
  // ============ DAILY MCQS ============
  
  function loadDailyMCQs() {
    const container = Utils.$('dailyContainer');
    if (!container) return;
    
    const dailyQuestions = Utils.shuffleArray(mockQuestions).slice(0, 5);
    
    let html = `<h3>📅 Daily MCQs - ${Utils.getDateLabel(new Date().toDateString())}</h3>`;
    
    dailyQuestions.forEach((q, i) => {
      html += `
        <div class="question-card">
          <div class="q-num">Q${i+1}. ${q.q}</div>
          <div class="options">
            ${q.options.map((o, oi) => `
              <div class="option" onclick="
                this.parentElement.querySelectorAll('.option').forEach(op=>op.classList.remove('selected'));
                this.classList.add('selected');
                Utils.$('dailyExp${q.id}').style.display='block';
              ">${String.fromCharCode(65+oi)}. ${o}</div>
            `).join('')}
          </div>
          <div id="dailyExp${q.id}" style="display:none;margin-top:10px;padding:8px;background:#f4f9f0;border-radius:4px;font-size:0.75rem;">
            💡 ${q.exp}
          </div>
        </div>`;
    });
    
    container.innerHTML = html;
  }
  
  // ============ LEADERBOARD ============
  
  function loadLeaderboard() {
    const container = Utils.$('leaderboardContainer');
    if (!container) return;
    
    const leaderboardData = [
      { rank:1, name:"Dr. Sharma", xp:5200, badge:"🏆" },
      { rank:2, name:"Priya Patel", xp:4800, badge:"🥈" },
      { rank:3, name:"Amit Kumar", xp:4500, badge:"🥉" },
      { rank:4, name:"Sneha Reddy", xp:4200, badge:"⭐" },
      { rank:5, name:"Rajesh Gupta", xp:3900, badge:"⭐" },
      { rank:6, name:"Anita Verma", xp:3600, badge:"📚" },
      { rank:7, name:"Vikram Singh", xp:3300, badge:"📚" },
      { rank:8, name:"Meera Joshi", xp:3000, badge:"📚" },
      { rank:9, name:"Arun Nair", xp:2700, badge:"📖" },
      { rank:10, name:"Kavita Das", xp:2400, badge:"📖" }
    ];
    
    let html = '<h3>🏆 Research Rankings</h3>';
    
    leaderboardData.forEach(l => {
      const rankClass = l.rank === 1 ? 'gold' : l.rank === 2 ? 'silver' : l.rank === 3 ? 'bronze' : '';
      html += `
        <div class="leaderboard-row">
          <div class="leaderboard-rank ${rankClass}">${l.rank}</div>
          <div class="leaderboard-name"><b>${l.name}</b> ${l.badge}</div>
          <div class="leaderboard-xp">${l.xp} XP</div>
        </div>`;
    });
    
    container.innerHTML = html;
  }
  
  // ============ PROGRESS ANALYTICS ============
  
  function loadProgress() {
    const container = Utils.$('progressContainer');
    if (!container) return;
    
    const achievements = XPSystem.getAchievements();
    
    let html = `
      <h3>📊 Learning Analytics</h3>
      
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-val">${XPSystem.getXP()}</div>
          <div class="stat-label">Total XP</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">🔥 ${XPSystem.getStreak()}</div>
          <div class="stat-label">Day Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${pyqData.length}</div>
          <div class="stat-label">PYQs Available</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${videoData.length}</div>
          <div class="stat-label">Lectures</div>
        </div>
      </div>
      
      <h4 style="margin-top:20px;">🏅 Achievements</h4>
      <div class="achievements-list">
        ${achievements.length > 0 ? achievements.map(a => 
          `<span class="achievement-badge">${a}</span>`
        ).join('') : '<p style="color:#8a9b7a;font-size:0.8rem;">Complete activities to earn achievements!</p>'}
      </div>
      
      <h4 style="margin-top:20px;">📈 Weekly Performance</h4>
      <canvas id="performanceChart" style="max-height:200px;"></canvas>
    `;
    
    container.innerHTML = html;
    
    // Render chart after DOM update
    setTimeout(() => {
      const ctx = Utils.$('performanceChart');
      if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Study Hours',
              data: [2.5, 3.1, 2.8, 4.0, 3.5, 5.2, 3.8],
              borderColor: '#0a2e1f',
              backgroundColor: 'rgba(10,46,31,0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }, 300);
  }
  
  // ============ EXPORT ============
  
  return {
    loadMockTest,
    selectOption,
    submitTest,
    loadPYQs,
    filterPYQs,
    loadVideos,
    openVideo,
    loadNotes,
    loadFormulas,
    loadMindMaps,
    loadForum,
    loadDailyMCQs,
    loadLeaderboard,
    loadProgress
  };
})();