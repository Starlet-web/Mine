// ============ STEALTH MODE MODULE ============
const StealthMode = (function() {
  'use strict';
  
  let isActive = false;
  let currentDecoyText = '';
  
  // Decoy text templates
  const decoyTexts = {
    molecular: [
      "What is the mechanism of DNA replication in prokaryotes? Please explain the role of DNA Polymerase III and the function of helicase enzyme in detail.",
      "Can you explain the process of transcription in eukaryotes? I need to understand the role of transcription factors TFIID and TFIIB in promoter recognition.",
      "Describe the lac operon model and its regulation by allolactose and cAMP-CAP complex in E. coli. How does catabolite repression work?",
      "What are the different types of RNA polymerases in eukaryotes and their specific functions? Explain the promoter elements recognized by each.",
      "Explain the CRISPR-Cas9 gene editing mechanism in detail. What is the role of PAM sequence and how does HDR differ from NHEJ repair?",
      "How does alternative splicing generate protein diversity from a single gene? Give examples from the DSCAM gene and immunoglobulin genes.",
      "What is the role of microRNAs in post-transcriptional gene regulation? Explain the mechanism of RNA interference.",
      "Describe the process of translation initiation in eukaryotes with reference to Kozak sequence and initiation factors.",
      "How do epigenetic modifications like DNA methylation and histone acetylation affect gene expression patterns?",
      "What are the applications of PCR in molecular diagnostics? Explain RT-PCR, qPCR, and their uses in research."
    ],
    ecology: [
      "Explain Lotka-Volterra predator-prey model with mathematical equations. What are the assumptions and limitations of this model?",
      "What is ecological succession? Differentiate between primary and secondary succession with suitable examples from Indian ecosystems.",
      "Describe the concept of ecological niche. How does Gause's competitive exclusion principle apply to species coexistence?",
      "What is the 10% law of energy flow in ecosystems? Who proposed it and what are its implications for food chain length?",
      "Explain the theory of island biogeography by MacArthur and Wilson. How does it apply to conservation biology and reserve design?",
      "What are biodiversity hotspots? Name the four biodiversity hotspots in India and discuss their conservation significance.",
      "Describe r and K selection strategies with suitable examples from animal kingdom. How do these strategies affect population growth?",
      "How do biogeochemical cycles operate? Explain carbon cycle with reference to global warming and climate change impacts.",
      "What are ecosystem services? Classify them according to MEA 2005 with examples from Indian ecosystems.",
      "Explain the concept of metapopulation dynamics. How does habitat fragmentation affect species survival and connectivity?"
    ],
    genetics: [
      "Explain Mendel's laws of inheritance with suitable examples. What are the exceptions to Mendelian ratios and why do they occur?",
      "What is linkage and crossing over? How did Morgan's experiments on Drosophila establish the chromosomal theory of inheritance?",
      "Explain Hardy-Weinberg equilibrium principle. What are the factors affecting gene frequencies in natural populations?",
      "Describe the different types of epistasis with examples. How does epistasis modify the typical 9:3:3:1 dihybrid ratio?",
      "What is the mechanism of sex determination in different organisms? Explain genic balance theory and environmental sex determination.",
      "How do you construct a genetic map using three-point test cross? Explain with a worked example showing gene order and distances.",
      "What is cytoplasmic inheritance? Explain with reference to mitochondrial DNA and chloroplast genes in appropriate organisms.",
      "Describe the phenomenon of polyploidy and its significance in evolution and crop improvement. Give examples of autopolyploidy and allopolyploidy.",
      "What are transposable elements? Explain different types of transposons and their significance in genome evolution and mutation.",
      "How does X-inactivation occur in mammals? Explain the Lyon hypothesis, Xist RNA mechanism, and clinical implications."
    ],
    biochemistry: [
      "Explain enzyme kinetics using Michaelis-Menten equation. How do competitive, non-competitive, and uncompetitive inhibitors affect Km and Vmax?",
      "Describe the complete pathway of glycolysis including all enzymes, intermediates, and energy yield. What are the regulatory steps?",
      "What is the TCA cycle? Explain its amphibolic nature and the significance of anaplerotic reactions in metabolism.",
      "How does oxidative phosphorylation occur? Explain the chemiosmotic theory and the role of ATP synthase in ATP production.",
      "Describe β-oxidation of fatty acids. How does the oxidation of saturated, unsaturated, and odd-chain fatty acids differ?",
      "What are the different classes of enzymes according to IUBMB classification? Give examples and reactions catalyzed by each class.",
      "How is blood glucose regulated? Describe the roles of insulin, glucagon, epinephrine, and cortisol in glucose homeostasis.",
      "Explain the urea cycle and its significance in nitrogen metabolism. How is it linked to the TCA cycle?",
      "What are isozymes? Explain with reference to lactate dehydrogenase (LDH) and its clinical significance.",
      "Describe the process of gluconeogenesis. What are the bypass reactions and how does it differ from glycolysis?"
    ],
    immunology: [
      "Explain the structure and function of different classes of immunoglobulins. Draw and label the structure of IgG antibody.",
      "What is the complement system? Describe the classical, alternative, and lectin pathways of complement activation.",
      "How does MHC restriction operate in T cell activation? Differentiate between MHC Class I and Class II antigen processing pathways.",
      "Explain the mechanism of V(D)J recombination in antibody diversity generation. What is the role of RAG1/RAG2 enzymes?",
      "What are the different types of hypersensitivity reactions? Explain Type I hypersensitivity with reference to allergy and anaphylaxis.",
      "Describe the process of antigen presentation by dendritic cells and subsequent T cell activation including costimulatory signals.",
      "How do vaccines work? Compare different types of vaccines (live attenuated, killed, subunit, mRNA) with examples.",
      "What is immunological tolerance? Explain central and peripheral tolerance mechanisms and their role in preventing autoimmunity.",
      "Describe the roles of different cytokines (IL-1, IL-2, IL-4, IFN-γ, TNF-α) in immune response regulation.",
      "How does HIV affect the immune system? Explain the pathogenesis of AIDS including CD4+ T cell depletion mechanisms."
    ],
    physiology: [
      "Explain the mechanism of nerve impulse conduction. How does saltatory conduction in myelinated axons increase conduction velocity?",
      "Describe the process of muscle contraction with reference to sliding filament theory. Explain the role of calcium and ATP.",
      "How is body temperature regulated in homeotherms? Explain the role of hypothalamus, thermoreceptors, and effector mechanisms.",
      "What is the mechanism of urine formation? Explain the countercurrent multiplier system in the loop of Henle and its significance.",
      "Describe the cardiac cycle with reference to ECG waves, heart sounds, and pressure changes in different chambers.",
      "How does gas exchange occur in mammals? Explain oxygen-hemoglobin dissociation curve and factors affecting it (Bohr effect, temperature).",
      "Explain the process of digestion and absorption of carbohydrates, proteins, and lipids in the mammalian digestive system.",
      "What is the role of hormones in calcium homeostasis? Explain the actions of PTH, calcitonin, and vitamin D3.",
      "Describe the mechanism of vision with reference to phototransduction cascade in rod cells and the role of rhodopsin.",
      "How does osmoregulation differ in freshwater fish, marine fish, and terrestrial mammals? Explain hormonal control."
    ]
  };
  
  // ============ ACTIVATE/DEACTIVATE ============
  
  function activate() {
    if (!Auth.isLoggedIn()) {
      Utils.showToast('Please login first', 3000, 'error');
      return;
    }
    
    isActive = true;
    Utils.$('stealthOverlay').style.display = 'flex';
    Utils.$('stealthInput').focus();
    
    // Load last draft
    const drafts = Utils.getStorage('stealthDrafts', {});
    const lastDraft = drafts.last;
    if (lastDraft) {
      Utils.$('stealthInput').value = lastDraft.real || '';
      Utils.$('decoyTopic').value = lastDraft.topic || 'molecular';
    }
    
    updatePreview();
    Utils.showToast('🕵️ Stealth Typing Mode Activated');
    HistorySystem.addEntry('security', 'Stealth Mode', 'Stealth typing mode activated');
  }
  
  function deactivate() {
    isActive = false;
    Utils.$('stealthOverlay').style.display = 'none';
    Utils.showToast('Stealth mode deactivated');
  }
  
  function toggle() {
    if (isActive) deactivate();
    else activate();
  }
  
  // ============ DECOY GENERATION ============
  
  function updatePreview() {
    const realInput = Utils.$('stealthInput').value.trim();
    const topic = Utils.$('decoyTopic').value;
    const charCount = realInput.length;
    
    Utils.$('stealthCharCount').textContent = `${charCount} character${charCount !== 1 ? 's' : ''}`;
    
    if (realInput) {
      currentDecoyText = generateDecoy(realInput, topic);
      Utils.$('stealthPreview').innerHTML = `<span class="decoy-text">${currentDecoyText}</span>`;
    } else {
      currentDecoyText = '';
      Utils.$('stealthPreview').innerHTML = '<span class="placeholder-text">Start typing to see the decoy text...</span>';
    }
  }
  
  function generateDecoy(realMessage, topic) {
    const texts = decoyTexts[topic] || decoyTexts.molecular;
    const wordCount = realMessage.split(/\s+/).length;
    
    let bestMatch = texts[0];
    let bestDiff = Infinity;
    
    texts.forEach(text => {
      const diff = Math.abs(text.split(/\s+/).length - wordCount);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMatch = text;
      }
    });
    
    if (wordCount > 50) {
      const extra = Utils.shuffleArray(texts).slice(0, 3);
      return bestMatch + ' Additionally, ' + extra.join(' Furthermore, ');
    }
    
    return bestMatch;
  }
  
  function cycleTopic() {
    const topics = Object.keys(decoyTexts);
    const current = Utils.$('decoyTopic').value;
    const idx = topics.indexOf(current);
    const next = topics[(idx + 1) % topics.length];
    Utils.$('decoyTopic').value = next;
    updatePreview();
    Utils.showToast(`🔄 Topic: ${next}`);
  }
  
  // ============ SEND MESSAGE ============
  
  async function sendNormal() {
    await sendStealthMessage(false);
  }
  
  async function sendSelfDestruct() {
    await sendStealthMessage(true);
  }
  
  async function sendStealthMessage(selfDestruct) {
    const realMessage = Utils.$('stealthInput').value.trim();
    
    if (!realMessage || !Auth.isLoggedIn()) {
      Utils.showToast('⚠️ Type a message first', 3000, 'warning');
      return;
    }
    
    const encoded = MessageSystem.encodeMessage(realMessage);
    
    try {
      await Database.sendMessage({
        type: 'text',
        text: encoded,
        selfDestruct: selfDestruct,
        stealthMode: true
      });
      
      // Show decoy in chat
      const container = Utils.$('messagesContainer');
      const decoyDiv = document.createElement('div');
      decoyDiv.className = 'message-bubble own persistent-mock';
      decoyDiv.innerHTML = `
        <span class="msg-label">🧑‍🔬 Research Query</span>
        ${currentDecoyText || generateDecoy(realMessage)}
        <div class="message-meta">
          <span>${Utils.formatTime(new Date())}</span>
          <span class="seen-tick single">✓</span>
        </div>`;
      container.appendChild(decoyDiv);
      Utils.scrollToBottom();
      
      // Track
      HistorySystem.addEntry('message', 'Stealth Message', Utils.truncate(realMessage, 60));
      XPSystem.addXP(15);
      
      Utils.showToast(selfDestruct ? '⏱️ Self-destruct stealth sent' : '🚀 Stealth message sent');
      
      // Clear and deactivate
      Utils.$('stealthInput').value = '';
      updatePreview();
      deactivate();
      
    } catch (e) {
      Utils.showToast('Failed to send', 3000, 'error');
    }
  }
  
  // ============ DRAFT ============
  
  function saveDraft() {
    const realMessage = Utils.$('stealthInput').value.trim();
    if (!realMessage) {
      Utils.showToast('⚠️ Nothing to save', 3000, 'warning');
      return;
    }
    
    const drafts = Utils.getStorage('stealthDrafts', {});
    drafts.last = {
      real: realMessage,
      topic: Utils.$('decoyTopic').value,
      timestamp: new Date().toISOString()
    };
    
    Utils.setStorage('stealthDrafts', drafts);
    Utils.showToast('💾 Draft saved');
  }
  
  // ============ INITIALIZE ============
  
  function initialize() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isActive) {
        deactivate();
      }
    });
    
    // Decoy topic change listener
    Utils.$('decoyTopic')?.addEventListener('change', updatePreview);
  }
  
  // ============ EXPORT ============
  
  return {
    activate,
    deactivate,
    toggle,
    isActive: () => isActive,
    updatePreview,
    cycleTopic,
    sendNormal,
    sendSelfDestruct,
    saveDraft,
    initialize
  };
})();