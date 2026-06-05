// ============ DECOY CONVERSATIONS MODULE ============
const DecoySystem = (function() {
  'use strict';
  
  let isActive = false;
  let originalMessages = [];
  let currentConversationId = null;
  
  // Complete decoy conversations
  const conversations = {
    molecular_advanced: {
      title: "Advanced Molecular Biology Discussion",
      topic: "molecular",
      messages: [
        { type: 'sent', text: 'Can you explain the detailed mechanism of CRISPR-Cas9 gene editing? I need to understand the role of guide RNA and PAM sequence for my dissertation work on gene therapy applications.' },
        { type: 'received', text: 'CRISPR-Cas9 is an adaptive immune system in bacteria. The Cas9 endonuclease from Streptococcus pyogenes recognizes PAM sequence (5\'-NGG-3\'). The guide RNA (sgRNA) contains crRNA-tracrRNA chimera that directs Cas9 to target DNA. RuvC and HNH domains create double-strand breaks, which are repaired by NHEJ or HDR pathways.' },
        { type: 'sent', text: 'How does alternative splicing increase protein diversity? Please explain with specific examples from immunology and neurobiology.' },
        { type: 'received', text: 'Alternative splicing allows a single gene to produce multiple protein isoforms. The DSCAM gene in Drosophila can generate 38,016 isoforms through alternative splicing. In immunology, immunoglobulin genes use alternative splicing to produce membrane-bound and secreted forms. In neurobiology, neurexin genes produce thousands of isoforms affecting synapse formation.' },
        { type: 'sent', text: 'What is the role of enhancers and silencers in eukaryotic gene regulation? How do insulators affect enhancer-promoter interactions?' },
        { type: 'received', text: 'Enhancers are cis-acting DNA elements that increase transcription independently of orientation and distance (up to 1 Mb). They bind activator proteins recruiting coactivators like Mediator complex and histone acetyltransferases. Silencers repress transcription by binding repressor proteins. Insulators/boundary elements block enhancer-promoter interactions when placed between them. The locus control region of β-globin genes exemplifies long-range regulation.' }
      ]
    },
    ecology_research: {
      title: "Ecological Research Discussion",
      topic: "ecology",
      messages: [
        { type: 'sent', text: 'Explain Lotka-Volterra predator-prey model with mathematical derivations. What are the key predictions of this model for population cycles?' },
        { type: 'received', text: 'The Lotka-Volterra model: dN/dt = rN - aNP (prey), dP/dt = bNP - mP (predator). Where N=prey, P=predator, r=growth rate, a=attack rate, b=conversion efficiency, m=mortality. The isoclines intersect at equilibrium: N*=m/b, P*=r/a. The model predicts cyclic oscillations with predator lagging behind prey by π/2 phase difference.' },
        { type: 'sent', text: 'What are the limitations of this model and how have they been addressed in modern ecology?' },
        { type: 'received', text: 'Limitations include: (1) No prey density dependence, (2) Linear functional response only, (3) No spatial heterogeneity, (4) No age/stage structure, (5) Deterministic. Modified models: Rosenzweig-MacArthur with Type II functional response and logistic prey growth; Nicholson-Bailey for host-parasitoid systems; DeAngelis model with Beddington-DeAngelis functional response.' },
        { type: 'sent', text: 'How does the theory of island biogeography apply to conservation biology and protected area design?' },
        { type: 'received', text: 'MacArthur & Wilson (1967): Species richness on islands determined by equilibrium between immigration and extinction. S = cA^z (species-area relationship). Conservation applications: SLOSS debate, habitat fragmentation effects, corridor design, edge effects. Modern conservation uses metapopulation theory and landscape connectivity analysis for reserve network design.' }
      ]
    },
    genetics_problems: {
      title: "Genetics Problem Solving",
      topic: "genetics",
      messages: [
        { type: 'sent', text: 'In a population, the frequency of recessive allele causing a disease is 0.2. What percentage of the population are carriers? Please show the calculation.' },
        { type: 'received', text: 'Using Hardy-Weinberg: p + q = 1. Given q = 0.2, so p = 0.8. Carrier frequency = 2pq = 2 × 0.8 × 0.2 = 0.32. Therefore, 32% of the population are carriers (heterozygous). The disease frequency (homozygous recessive) = q² = 0.04 = 4%.' },
        { type: 'sent', text: 'How do you calculate map distance from a three-point test cross? Explain the step-by-step procedure.' },
        { type: 'received', text: 'Steps: (1) Identify parental and double crossover types. (2) Determine gene order by comparing parental and DCO. (3) Calculate recombination frequency for each interval. (4) Add map distances. (5) Calculate interference = 1 - (observed DCO/expected DCO). The middle gene is the one that differs between parental and DCO combinations.' },
        { type: 'sent', text: 'Explain the difference between incomplete dominance and codominance with clear examples.' },
        { type: 'received', text: 'Incomplete dominance: Heterozygote shows intermediate phenotype, F2 ratio 1:2:1. Example: Snapdragon (RR=red, Rr=pink, rr=white). Codominance: Both alleles expressed equally in heterozygote. Example: ABO blood group (IAIB = AB type, both antigens expressed). MN blood group also shows codominance.' }
      ]
    },
    biochemistry_advanced: {
      title: "Biochemistry Analysis",
      topic: "biochemistry",
      messages: [
        { type: 'sent', text: 'Explain competitive vs non-competitive enzyme inhibition with detailed kinetics and Lineweaver-Burk plot interpretations.' },
        { type: 'received', text: 'Competitive inhibition: Inhibitor competes for active site. Vmax unchanged, Km increases. Lineweaver-Burk: lines intersect at y-axis. Non-competitive: Inhibitor binds allosteric site. Vmax decreases, Km unchanged. L-B: lines intersect at x-axis. Uncompetitive: Inhibitor binds ES complex only. Both Vmax and Km decrease. Mixed: Both parameters change.' },
        { type: 'sent', text: 'How many ATP molecules are produced from complete oxidation of one glucose molecule? Show the detailed calculation.' },
        { type: 'received', text: 'Complete oxidation: Glycolysis (2 ATP + 2 NADH), Pyruvate oxidation (2 NADH), TCA cycle (2 GTP + 6 NADH + 2 FADH2). Using malate-aspartate shuttle: 2 + 5 + 5 + 2 + 15 + 3 = 32 ATP. Using glycerol-3-phosphate shuttle: 30 ATP. Prokaryotes: 36-38 ATP (no mitochondrial transport cost).' }
      ]
    },
    immunology_study: {
      title: "Immunology Study Session",
      topic: "immunology",
      messages: [
        { type: 'sent', text: 'Explain the structure of IgG antibody with all domains and fragments. What are the functions of Fab and Fc regions?' },
        { type: 'received', text: 'IgG: Y-shaped monomer (150 kDa). Two heavy chains (γ, 50 kDa) and two light chains (κ/λ, 25 kDa). Variable (V) and constant (C) domains. Fab: antigen-binding (VH+VL, CH1+CL). Fc: effector function (CH2+CH3). Hinge region provides flexibility. Papain: 2 Fab + 1 Fc. Pepsin: F(ab\')2 + degraded Fc. Complement binding at CH2 domain.' },
        { type: 'sent', text: 'What are the differences between MHC Class I and Class II antigen processing pathways?' },
        { type: 'received', text: 'MHC I: All nucleated cells, endogenous antigens, proteasome→TAP→ER loading, recognized by CD8+ T cells. MHC II: APCs only, exogenous antigens, endolysosomal processing, invariant chain→CLIP→HLA-DM, recognized by CD4+ T cells. Cross-presentation allows exogenous antigens on MHC I by some DCs.' }
      ]
    },
    physiology_session: {
      title: "Physiology Discussion",
      topic: "physiology",
      messages: [
        { type: 'sent', text: 'Explain the mechanism of nerve impulse conduction including action potential phases and ion channel dynamics.' },
        { type: 'received', text: 'Resting potential (-70mV) by Na+/K+ ATPase. Action potential: Depolarization (Na+ channels open at -55mV threshold), Repolarization (Na+ inactivation, K+ activation), Hyperpolarization (delayed K+ closure). Saltatory conduction in myelinated axons increases speed. Refractory periods ensure unidirectional propagation.' },
        { type: 'sent', text: 'Describe the countercurrent multiplier system in the loop of Henle and its role in urine concentration.' },
        { type: 'received', text: 'Descending limb: permeable to water (AQP1), impermeable to NaCl. Ascending limb: impermeable to water, active NaCl transport (NKCC2). Creates corticomedullary gradient (300→1200 mOsm). Countercurrent exchanger in vasa recta maintains gradient. ADH increases urea recycling and AQP2 insertion for water reabsorption.' }
      ]
    },
    mixed_revision: {
      title: "Mixed Topic Revision",
      topic: "mixed",
      messages: [
        { type: 'sent', text: 'What are the key differences between mitosis and meiosis? I need a comprehensive comparison for my exam preparation.' },
        { type: 'received', text: 'Mitosis: One division, 2 diploid daughter cells, genetically identical, somatic cells. Meiosis: Two divisions, 4 haploid cells, genetically varied, germ cells. Prophase I has 5 stages with synapsis and crossing over. Metaphase I: bivalents align. Anaphase I: homologous chromosomes separate. Meiosis II similar to mitosis.' },
        { type: 'sent', text: 'What is the Hardy-Weinberg equilibrium? State its conditions and explain why it is important in population genetics.' },
        { type: 'received', text: 'Hardy-Weinberg: In large, randomly mating population without mutation, migration, or selection, allele frequencies remain constant. p² + 2pq + q² = 1. Five conditions: large population, random mating, no mutation, no gene flow, no selection. Serves as null hypothesis for detecting evolutionary forces.' },
        { type: 'sent', text: 'Explain the structure and function of mitochondria with reference to endosymbiotic theory.' },
        { type: 'received', text: 'Mitochondria: Double membrane (outer smooth, inner with cristae), matrix, mtDNA (circular), 70S ribosomes. Endosymbiotic theory (Lynn Margulis): originated from aerobic bacteria engulfed by ancestral eukaryote. Evidence: double membrane, own DNA, independent replication, antibiotic sensitivity similar to bacteria.' }
      ]
    }
  };
  
  // ============ LOAD DECOY ============
  
  function loadConversation(conversationId) {
    const conversation = conversations[conversationId];
    if (!conversation) return;
    
    // Save current messages
    const container = Utils.$('messagesContainer');
    originalMessages = Array.from(container.children).filter(
      c => !c.classList.contains('typing-indicator') && !c.classList.contains('persistent-mock')
    );
    
    // Clear container
    container.innerHTML = '';
    
    // Add date divider
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date-divider';
    dateDiv.textContent = Utils.getDateLabel(new Date().toDateString());
    container.appendChild(dateDiv);
    
    // Add messages
    const now = new Date();
    conversation.messages.forEach((msg, index) => {
      const msgTime = new Date(now - (conversation.messages.length - index) * 120000);
      const div = document.createElement('div');
      div.className = `message-bubble ${msg.type === 'sent' ? 'own' : ''} persistent-mock decoy-message`;
      div.innerHTML = `
        <span class="msg-label">${msg.type === 'sent' ? '🧑‍🔬 Research Query' : '🤖 AI Research Analysis'}</span>
        ${msg.text}
        <div class="message-meta">
          <span>${Utils.formatTime(msgTime)}</span>
          ${msg.type === 'sent' ? '<span class="seen-tick">✓✓</span>' : ''}
        </div>`;
      container.appendChild(div);
    });
    
    isActive = true;
    currentConversationId = conversationId;
    
    // Update UI
    Utils.$('decoyIndicator').style.display = 'inline';
    Utils.$('decoyIndicator').textContent = 'DECOY';
    Utils.$('partnerDisplayName').textContent = 'AI Online (Study)';
    
    Utils.scrollToBottom();
    Utils.$('decoyModal').classList.remove('active');
    
    HistorySystem.addEntry('security', 'Decoy Loaded', conversation.title);
    Utils.showToast(`📋 ${conversation.title}`);
  }
  
  function showLoader() {
    const optionsContainer = Utils.$('decoyOptions');
    if (!optionsContainer) return;
    
    let html = '';
    Object.entries(conversations).forEach(([id, conv]) => {
      html += `
        <div class="decoy-option" onclick="DecoySystem.loadConversation('${id}')">
          <div class="decoy-option-title">${conv.title}</div>
          <div class="decoy-option-meta">${conv.messages.length} messages • ${conv.topic}</div>
        </div>`;
    });
    
    optionsContainer.innerHTML = html;
    Utils.$('decoyModal').classList.add('active');
  }
  
  function quickSwitch() {
    const keys = Object.keys(conversations);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    loadConversation(randomKey);
  }
  
  function clear(silent = false) {
    if (!isActive) return;
    
    isActive = false;
    currentConversationId = null;
    
    const container = Utils.$('messagesContainer');
    container.innerHTML = '';
    
    // Restore original or defaults
    if (originalMessages.length > 0) {
      originalMessages.forEach(msg => container.appendChild(msg));
    }
    
    originalMessages = [];
    
    Utils.$('decoyIndicator').style.display = 'none';
    Utils.$('partnerDisplayName').textContent = 'AI Offline';
    
    Utils.scrollToBottom();
    Utils.$('decoyModal').classList.remove('active');
    
    if (!silent) Utils.showToast('Decoy cleared');
  }
  
  // ============ INITIALIZE ============
  
  function initialize() {
    // Listen for real messages to auto-clear decoy
    MessageSystem.startListening = (function(original) {
      return function() {
        original();
        
        // Override to detect new messages
        if (isActive && Database.listenToMessages) {
          const origCallback = Database.listenToMessages;
          Database.listenToMessages = function(callback, onError) {
            return origCallback.call(Database, function(messages, changes) {
              callback(messages, changes);
              
              changes.forEach(change => {
                if (change.type === 'added' && isActive) {
                  const data = change.doc.data();
                  if (data.senderId !== Auth.getCurrentUser()?.uid) {
                    clear(true);
                    Utils.showToast('📩 Real message received - Decoy cleared');
                  }
                }
              });
            }, onError);
          };
        }
      };
    })(MessageSystem.startListening);
  }
  
  // ============ EXPORT ============
  
  return {
    loadConversation,
    showLoader,
    quickSwitch,
    clear,
    isActive: () => isActive,
    initialize
  };
})();