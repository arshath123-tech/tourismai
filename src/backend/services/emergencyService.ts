export function getEmergencyContactsForDestination(destination: string, nationality: string = 'India', aiText: string = ''): Record<string, string> {
  const destLower = destination.toLowerCase().trim();
  const contacts: Record<string, string> = {};

  // 1. Try parsing from AI response text if explicit
  if (aiText) {
    const policeMatch = aiText.match(/Police(?:\s+Emergency)?[:\s]+([\d\+\-\s\/]+)/i);
    const ambMatch = aiText.match(/(?:Ambulance|Medical)(?:\s+\/\s*Fire)?[:\s]+([\d\+\-\s\/]+)/i);
    const touristMatch = aiText.match(/(?:Tourist Helpline|Tourist Police|Hotline)[:\s]+([\d\+\-\s\/]+)/i);
    const embassyMatch = aiText.match(/(?:Diplomatic Mission|Embassy|Consulate)[^:\n]*[:\s]+([^\n\r]+)/i);

    if (policeMatch && policeMatch[1] && policeMatch[1].trim().length < 25) {
      contacts['Police'] = policeMatch[1].trim();
    }
    if (ambMatch && ambMatch[1] && ambMatch[1].trim().length < 25) {
      contacts['Ambulance / Medical'] = ambMatch[1].trim();
    }
    if (touristMatch && touristMatch[1] && touristMatch[1].trim().length < 35) {
      contacts['Tourist Helpline'] = touristMatch[1].trim();
    }
    if (embassyMatch && embassyMatch[1] && embassyMatch[1].trim().length < 60) {
      contacts['Embassy'] = embassyMatch[1].trim();
    }
  }

  // 2. Comprehensive Destination & Country-specific Emergency Protocols
  if (destLower.includes('japan') || destLower.includes('tokyo') || destLower.includes('kyoto') || destLower.includes('osaka') || destLower.includes('hiroshima') || destLower.includes('fuji')) {
    contacts['Police'] = contacts['Police'] || '110';
    contacts['Ambulance / Fire'] = contacts['Ambulance / Medical'] || '119';
    contacts['Tourist Hotline'] = contacts['Tourist Helpline'] || '050-3816-2720 (JNTO 24x7)';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Tokyo (+81 3-3262-2391)`;
  } else if (destLower.includes('india') || destLower.includes('gujarat') || destLower.includes('delhi') || destLower.includes('mumbai') || destLower.includes('agra') || destLower.includes('goa') || destLower.includes('kerala') || destLower.includes('jaipur') || destLower.includes('surat') || destLower.includes('ahmedabad') || destLower.includes('varanasi') || destLower.includes('udaipur') || destLower.includes('bengaluru')) {
    contacts['Police'] = contacts['Police'] || '112 / 100';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '108 / 102';
    contacts['Fire Emergency'] = '101';
    contacts['Tourist Helpline'] = contacts['Tourist Helpline'] || '1363 (24x7 Toll-Free)';
    contacts['Embassy'] = contacts['Embassy'] || `Consular Desk (${nationality} Mission / MEA India)`;
  } else if (destLower.includes('france') || destLower.includes('paris') || destLower.includes('nice') || destLower.includes('lyon')) {
    contacts['Police'] = contacts['Police'] || '17 / 112';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '15 / 112';
    contacts['Fire Emergency'] = '18 / 112';
    contacts['Tourist Support'] = '+33 1 40 70 70 70';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Paris (+33 1 40 76 55 00)`;
  } else if (destLower.includes('united arab emirates') || destLower.includes('dubai') || destLower.includes('uae') || destLower.includes('abu dhabi') || destLower.includes('sharjah')) {
    contacts['Police'] = contacts['Police'] || '999';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '998';
    contacts['Fire Emergency'] = '997';
    contacts['Tourist Police'] = contacts['Tourist Helpline'] || '901 / +971 800 4488';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy Abu Dhabi / Dubai Consulate`;
  } else if (destLower.includes('united kingdom') || destLower.includes('uk') || destLower.includes('london') || destLower.includes('manchester') || destLower.includes('edinburgh')) {
    contacts['Emergency'] = '999 / 112';
    contacts['Police (Non-Emergency)'] = '101';
    contacts['NHS Medical Helpline'] = '111';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} High Commission in London (+44 20 7836 9129)`;
  } else if (destLower.includes('united states') || destLower.includes('usa') || destLower.includes('us') || destLower.includes('york') || destLower.includes('california') || destLower.includes('chicago') || destLower.includes('washington')) {
    contacts['Police / Emergency'] = contacts['Police'] || '911';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '911';
    contacts['City Helpline'] = '311';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Washington, D.C.`;
  } else if (destLower.includes('singapore')) {
    contacts['Police'] = contacts['Police'] || '999';
    contacts['Ambulance / Fire'] = contacts['Ambulance / Medical'] || '995';
    contacts['Tourist Line'] = '1800 736 2000';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} High Commission in Singapore`;
  } else if (destLower.includes('thailand') || destLower.includes('bangkok') || destLower.includes('phuket') || destLower.includes('chiang mai')) {
    contacts['Tourist Police'] = '1155 (24x7)';
    contacts['Police'] = contacts['Police'] || '191';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '1669';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Bangkok`;
  } else if (destLower.includes('indonesia') || destLower.includes('bali') || destLower.includes('jakarta')) {
    contacts['Police'] = contacts['Police'] || '110 / 112';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '118';
    contacts['Bali Tourist Police'] = '+62 361 754599';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Jakarta`;
  } else if (destLower.includes('italy') || destLower.includes('rome') || destLower.includes('venice') || destLower.includes('milan')) {
    contacts['Police'] = contacts['Police'] || '112 (Carabinieri)';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '118';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Rome`;
  } else if (destLower.includes('spain') || destLower.includes('barcelona') || destLower.includes('madrid')) {
    contacts['Police'] = contacts['Police'] || '091 / 112';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '061 / 112';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Madrid`;
  } else if (destLower.includes('switzerland') || destLower.includes('zurich') || destLower.includes('geneva')) {
    contacts['Police'] = contacts['Police'] || '117 / 112';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '144 / 112';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Bern`;
  } else if (destLower.includes('south korea') || destLower.includes('seoul') || destLower.includes('busan') || destLower.includes('jeju')) {
    contacts['Police'] = contacts['Police'] || '112';
    contacts['Ambulance / Fire'] = contacts['Ambulance / Medical'] || '119';
    contacts['Tourist Helpline'] = '1330';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Seoul`;
  } else if (destLower.includes('australia') || destLower.includes('sydney') || destLower.includes('melbourne')) {
    contacts['Emergency'] = '000';
    contacts['Police'] = contacts['Police'] || '000 (Non-emergency 131 444)';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '000';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} High Commission in Canberra`;
  } else if (destLower.includes('egypt') || destLower.includes('cairo')) {
    contacts['Tourist Police'] = '126';
    contacts['Police'] = contacts['Police'] || '122';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '123';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Cairo`;
  } else if (destLower.includes('germany') || destLower.includes('berlin') || destLower.includes('munich') || destLower.includes('frankfurt')) {
    contacts['Police'] = contacts['Police'] || '110';
    contacts['Ambulance / Fire'] = contacts['Ambulance / Medical'] || '112';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Embassy in Berlin`;
  } else {
    const parts = destination.split(',');
    const country = parts.length > 1 ? parts[parts.length - 1].trim() : destination;
    contacts['Police'] = contacts['Police'] || '112 / 911 (Global Emergency)';
    contacts['Ambulance'] = contacts['Ambulance / Medical'] || '112 / Local Emergency Services';
    contacts['Embassy'] = contacts['Embassy'] || `${nationality} Diplomatic Mission (${country})`;
  }

  return contacts;
}

export function getRegionalScamsForDestination(destination: string, aiText: string = ''): string[] {
  const destLower = destination.toLowerCase().trim();

  if (destLower.includes('japan') || destLower.includes('tokyo') || destLower.includes('kyoto') || destLower.includes('osaka')) {
    return [
      "Kabukicho & Roppongi bar touts with hidden cover charges",
      "Overpriced unregulated street photo souvenir vendors",
      "Fake monk donation solicitations near crowded temple gates"
    ];
  } else if (destLower.includes('india') || destLower.includes('delhi') || destLower.includes('agra') || destLower.includes('jaipur') || destLower.includes('gujarat')) {
    return [
      "Unregulated auto-rickshaw & taxi drivers claiming hotel is closed",
      "Fake government tourism office redirection at transit hubs",
      "Commission-driven gem / handicraft shopping pressure"
    ];
  } else if (destLower.includes('france') || destLower.includes('paris')) {
    return [
      "String bracelet trick near Sacré-Cœur stairs",
      "Fake charity petition signers at Eiffel Tower plaza",
      "Distraction pickpocketing on crowded Metro Line 1 & 9"
    ];
  } else if (destLower.includes('united arab emirates') || destLower.includes('dubai')) {
    return [
      "Unregistered luxury airport transfer solicitation",
      "Fake designer perfumes & electronics in traditional souks",
      "Overpriced desert safari packages through unofficial agents"
    ];
  } else if (destLower.includes('italy') || destLower.includes('rome') || destLower.includes('venice')) {
    return [
      "Gladiator costume photo demands near Colosseum",
      "Distraction pickpocketing at Termini Station & buses",
      "Unpriced restaurant cover charges (coperto) at tourist squares"
    ];
  }

  return [
    "Unmetered airport transport overcharging",
    "Distraction pickpocketing in dense tourist plazas",
    "Fraudulent ticket touts near major monument entrances"
  ];
}
