// ============ EMERGENCY ALERT SYSTEM ============
const EmergencySystem = (function() {
  'use strict';
  
  let alertActive = false;
  let alertTimeout = null;
  
  // MSc Zoology auto-responses
  const autoResponses = {
    default: 'This is a research query related to advanced zoological sciences. The topic requires comprehensive analysis of animal biology, including taxonomy, physiology, evolution, and ecological interactions. I am reviewing your query and will provide a detailed MSc-level explanation.',
    
    ecology: 'Ecology is the scientific study of interactions among organisms and their environment. Key concepts include population dynamics (dN/dt = rN(1-N/K)), community structure, energy flow (Lindeman\'s 10% law), biogeochemical cycles, and ecological succession. Modern ecology integrates molecular tools, remote sensing, and climate change modeling.',
    
    molecular: 'Molecular biology concerns the molecular basis of biological activity. Central dogma: DNA→RNA→Protein. Key processes: DNA replication (semi-conservative, Meselson-Stahl 1958), transcription (RNA Pol II, transcription factors), translation (ribosomes, tRNA), gene regulation (operons, epigenetics). Techniques include PCR, CRISPR-Cas9, and RNA-seq.',
    
    genetics: 'Genetics studies genes, genetic variation, and heredity. Mendelian principles (segregation, independent assortment), extensions (epistasis, pleiotropy), linkage and crossing over (Morgan), population genetics (Hardy-Weinberg: p²+2pq+q²=1), molecular genetics (DNA structure, replication), and genomics.',
    
    biochemistry: 'Biochemistry explores chemical processes in living organisms. Enzyme kinetics (Michaelis-Menten: V₀=Vmax[S]/(Km+[S])), metabolism (glycolysis, TCA cycle, oxidative phosphorylation), bioenergetics (ATP, chemiosmotic theory), and macromolecular structure-function relationships.',
    
    immunology: 'Immunology studies the immune system. Innate immunity (barriers, phagocytes, complement) and adaptive immunity (B cells/antibodies, T cells). Immunoglobulin classes (IgG, IgM, IgA, IgE, IgD), MHC pathways (Class I and II), hypersensitivity types (I-IV), and immunological disorders.',
    
    physiology: 'Animal physiology examines how organisms function. Neurophysiology (action potentials, synaptic transmission), endocrinology (hormone signaling), cardiovascular (cardiac cycle), respiratory (gas exchange), renal (osmoregulation), and digestive physiology. Homeostasis maintains internal environment.',
    
    cell: 'Cell biology studies cell structure and function. Plasma membrane (fluid mosaic model), organelles (mitochondria, ER, Golgi), cytoskeleton, cell cycle (cyclins/CDKs), cell signaling (GPCR, RTK pathways), apoptosis (caspases, Bcl-2 family), and cancer biology.',
    
    evolution: 'Evolution is change in heritable characteristics over generations. Natural selection (Darwin), modern synthesis, speciation (allopatric, sympatric), molecular evolution (neutral theory, Kimura 1968), phylogenetic systematics (cladistics), and evolutionary developmental biology (evo-devo).',
    
    taxonomy: 'Taxonomy is the science of classification. Principles: binomial nomenclature (Linnaeus 1758), ICZN codes, type specimens (holotype, paratype), taxonomic hierarchy. Modern approaches: molecular systematics, DNA barcoding (COI, 16S rRNA), cladistics, and integrative taxonomy.'
  };
  
  // ============ CHECK MESSAGES ============
  
  function checkMessage(text, senderEmail) {
    if (!text) return;
    
    const lowerText = text.toLowerCase().trim();
    let isEmergency = false;
    
    // Check for emergency keywords
    for (let keyword of CONFIG.emergency.keywords) {
      if (lowerText.includes(keyword)) {
        isEmergency = true;
        break;
      }
    }
    
    if (isEmergency) {
      triggerAlert(text, senderEmail);
      sendAutoResponse(text);
    }
  }
  
  // ============ TRIGGER ALERT ============
  
  function triggerAlert(message, senderEmail) {
    alertActive = true;
    
    // Show banner
    const banner = Utils.$('emergencyAlert');
    if (banner) {
      banner.style.display = 'block';
      banner.classList.add('emergency-flash');
    }
    
    // Play sound
    Utils.playEmergencySound();
    
    // Vibrate
    Utils.vibrate([200, 100, 200, 100, 200, 500, 200, 100, 200]);
    
    // Show toast
    Utils.showEmergencyToast(
      `Partner needs assistance: "${Utils.truncate(message, 60)}"`
    );
    
    // Browser notification
    Utils.sendNotification('🆘 EMERGENCY ALERT', 
      `${senderEmail || 'Partner'} needs assistance`, 
      { requireInteraction: true, vibrate: [200, 100, 200, 100, 200] }
    );
    
    // Flash screen
    flashScreen();
    
    // Track
    HistorySystem.addEntry('emergency', 'Emergency Alert', Utils.truncate(message, 60));
    
    // Auto-dismiss
    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(dismiss, CONFIG.emergency.alertDuration);
  }
  
  function flashScreen() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,0,0,0.3); z-index: 99998; pointer-events: none;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }, 500);
  }
  
  function dismiss() {
    alertActive = false;
    const banner = Utils.$('emergencyAlert');
    if (banner) {
      banner.style.display = 'none';
      banner.classList.remove('emergency-flash');
    }
    clearTimeout(alertTimeout);
  }
  
  // ============ AUTO-RESPONSE ============
  
  function getTopicResponse(text) {
    const lowerText = text.toLowerCase();
    
    const topicKeywords = {
      ecology: ['ecology', 'ecosystem', 'environment', 'biodiversity', 'habitat', 'succession', 'population'],
      molecular: ['molecular', 'dna', 'rna', 'protein', 'replication', 'transcription', 'translation', 'crispr', 'gene'],
      genetics: ['gene', 'genetic', 'heredity', 'mendel', 'chromosome', 'hardy', 'weinberg', 'allele'],
      biochemistry: ['enzyme', 'metabolism', 'glycolysis', 'krebs', 'atp', 'oxidation', 'lipid', 'carbohydrate'],
      immunology: ['immune', 'antibody', 'antigen', 'immunity', 'mhc', 'lymphocyte', 'immunoglobulin'],
      physiology: ['physiology', 'neuron', 'nerve', 'hormone', 'endocrine', 'cardiac', 'respiratory', 'kidney'],
      cell: ['cell', 'organelle', 'membrane', 'mitochondria', 'cytoskeleton', 'apoptosis', 'mitosis'],
      evolution: ['evolution', 'natural selection', 'adaptation', 'speciation', 'fossil', 'phylogeny'],
      taxonomy: ['taxonomy', 'classification', 'species', 'nomenclature', 'iczn', 'systematics']
    };
    
    for (let [topic, keywords] of Object.entries(topicKeywords)) {
      for (let kw of keywords) {
        if (lowerText.includes(kw)) {
          return autoResponses[topic];
        }
      }
    }
    
    return autoResponses.default;
  }
  
  async function sendAutoResponse(originalMessage) {
    const response = getTopicResponse(originalMessage);
    const encoded = MessageSystem.encodeMessage(response);
    
    try {
      await Database.sendMessage({
        type: 'text',
        text: encoded,
        isAutoResponse: true
      });
      
      // Follow-up after delay
      setTimeout(async () => {
        const followUp = 'I am analyzing your query in detail. Please continue with your research while I prepare a comprehensive response with relevant citations and examples.';
        await Database.sendMessage({
          type: 'text',
          text: MessageSystem.encodeMessage(followUp),
          isAutoResponse: true
        });
      }, 3000);
      
      Utils.showToast('✅ Auto-response sent');
    } catch (e) {
      console.error('Auto-response failed:', e);
    }
  }
  
  // ============ TEST ============
  
  function test() {
    const testMessages = [
      'what is ecology and its importance in modern research',
      'explain the mechanism of DNA replication',
      'what are enzymes and their classification',
      'define cell division and its types'
    ];
    const randomTest = Utils.randomItem(testMessages);
    triggerAlert(randomTest, 'Test Partner');
    Utils.showToast('🧪 Testing emergency system...');
  }
  
  // ============ INITIALIZE ============
  
  function initialize() {
    // Emergency test button
    Utils.$('testEmergencyBtn')?.addEventListener('click', test);
    
    // Listen for emergency messages
    const origListenToMessages = Database.listenToMessages;
    Database.listenToMessages = function(callback, onError) {
      return origListenToMessages.call(Database, function(messages, changes) {
        callback(messages, changes);
        
        changes.forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.senderId !== Auth.getCurrentUser()?.uid && data.type === 'text') {
              checkMessage(MessageSystem.decodeMessage(data.text || ''), data.senderEmail);
            }
          }
        });
      }, onError);
    };
  }
  
  // ============ EXPORT ============
  
  return {
    checkMessage,
    triggerAlert,
    dismiss,
    test,
    initialize
  };
})();