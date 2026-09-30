const entry=(title,category,summary,definition,extra={})=>({title,key:title.toLowerCase(),category,summary,definition,example:"",aliases:[],isActive:true,isSystem:true,...extra});

export const antennaReferences=[
 entry("Dipole","Wire","Half-wave wire antenna","A balanced two-element antenna commonly cut for one operating band."),
 entry("End-Fed Half-Wave","Wire","EFHW","A half-wave wire antenna fed near one end through an impedance transformer.",{aliases:["EFHW"]}),
 entry("Random Wire","Wire","Multi-band wire","A non-resonant wire antenna normally used with a tuner and suitable counterpoise."),
 entry("Vertical","Vertical","Omnidirectional antenna","An upright antenna with low-angle radiation useful for local and long-distance work."),
 entry("Ground Plane","Vertical","Vertical with radials","A vertical radiator using conductive radials as its electrical ground plane."),
 entry("J-Pole","VHF/UHF","End-fed half-wave","A vertically polarized antenna popular for 2-meter and 70-centimeter FM operation."),
 entry("Yagi","Directional","Directional beam","A directional antenna using a driven element, reflector, and one or more directors."),
 entry("Log-Periodic","Directional","Wide-band beam","A directional antenna designed to operate across a broad frequency range."),
 entry("Magnetic Loop","Loop","Small tuned loop","A compact, high-Q loop antenna that requires careful tuning."),
 entry("Full-Wave Loop","Loop","One-wavelength loop","A closed wire loop approximately one wavelength around on its design band."),
 entry("Mobile Whip","Mobile","Vehicle antenna","A compact vertical antenna designed for installation on a vehicle."),
 entry("Discone","Scanner/VHF/UHF","Wide-band vertical","A broad-band antenna often used for scanning and VHF/UHF reception."),
 entry("Dummy Load","Test Equipment","Non-radiating load","A matched load used to test a transmitter without radiating an on-air signal.")
];

const morse={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..","0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----."};
export const cwReferences=[
 ...Object.entries(morse).map(([title,code])=>entry(title,/\d/.test(title)?"Numbers":"Letters",code,`International Morse code for ${/\d/.test(title)?"number":"letter"} ${title}.`)),
 entry("CQ","Operating","-.-. --.-","General call inviting any station to answer."),
 entry("SOS","Prosign","... --- ...","International distress signal."),
 entry("AR","Prosign",".-.-.","End of message prosign."),
 entry("SK","Prosign","...-.-","End of contact or end of transmission prosign."),
 entry("BT","Prosign","-...-","Separator or new-paragraph prosign."),
 entry("K","Prosign","-.-","Invitation for any station to transmit."),
 entry("KN","Prosign","-.--.","Invitation for only the named station to transmit."),
 entry("R","Operating",".-.","Received or understood."),
 entry("73","Operating","--... ...--","Best regards."),
 entry("QRS","Q Code","--.- .-. ...","Send more slowly."),
 entry("QRQ","Q Code","--.- .-. --.-","Send faster."),
 entry("QTH","Q Code","--.- - ....","Station location."),
 entry("QSL","Q Code","--.- ... .-..","Acknowledgment or confirmation of contact."),
 entry("QSO","Q Code","--.- ... ---","Radio contact between stations.")
];

export const technicalReferences=[
 entry("Ohm's Law","Electrical","V = I × R","Relationship between voltage, current, and resistance.",{example:"12 volts across 6 ohms produces 2 amperes."}),
 entry("Power Formula","Electrical","P = V × I","Electrical power equals voltage multiplied by current."),
 entry("Wavelength Formula","RF","λ = 300 ÷ f(MHz)","Approximate free-space wavelength in meters for a frequency in megahertz."),
 entry("Half-Wave Dipole Length","Antennas","468 ÷ f(MHz)","Approximate total dipole length in feet before final on-air trimming."),
 entry("Quarter-Wave Length","Antennas","234 ÷ f(MHz)","Approximate quarter-wave element length in feet before final trimming."),
 entry("SWR","Antennas","Standing Wave Ratio","Ratio describing the impedance match between transmitter, feed line, and load."),
 entry("Impedance","Electrical","Ohms (Ω)","Opposition to alternating current, including resistance and reactance."),
 entry("Resonance","Antennas","X = 0","Condition where inductive and capacitive reactance cancel at a frequency."),
 entry("Decibel","Measurements","dB","Logarithmic unit used to compare power or signal levels."),
 entry("Bandwidth","RF","Frequency span","Range of frequencies occupied by a signal or accepted by a system."),
 entry("Duty Cycle","Transmitters","Transmit-time percentage","Percentage of time a transmitter operates at power during a period."),
 entry("Coax Loss","Feed Line","dB per length","Signal power lost as radio-frequency energy travels through coaxial cable."),
 entry("ERP","RF","Effective Radiated Power","Transmitter power adjusted for antenna gain and feed-line loss."),
 entry("Frequency Conversion","Measurements","1 MHz = 1,000 kHz","Conversion relationship between megahertz and kilohertz."),
 entry("Series Circuit","Electrical","Same current","Circuit where components share one current path."),
 entry("Parallel Circuit","Electrical","Same voltage","Circuit where components connect across the same voltage points."),
 entry("Capacitance","Components","Farads (F)","Ability to store energy in an electric field."),
 entry("Inductance","Components","Henries (H)","Ability to store energy in a magnetic field."),
 entry("Reactance","Electrical","Ohms (Ω)","Frequency-dependent opposition produced by capacitance or inductance."),
 entry("Grounding","Safety","Station and RF grounding","Practices used for electrical safety, lightning protection, and RF control.")
];

const phoneticWords={A:"Alpha",B:"Bravo",C:"Charlie",D:"Delta",E:"Echo",F:"Foxtrot",G:"Golf",H:"Hotel",I:"India",J:"Juliett",K:"Kilo",L:"Lima",M:"Mike",N:"November",O:"Oscar",P:"Papa",Q:"Quebec",R:"Romeo",S:"Sierra",T:"Tango",U:"Uniform",V:"Victor",W:"Whiskey",X:"X-ray",Y:"Yankee",Z:"Zulu"};
const numberWords={"0":"Zero","1":"One","2":"Two","3":"Three","4":"Four","5":"Five","6":"Six","7":"Seven","8":"Eight","9":"Nine"};
export const phoneticAlphabetReferences=[
 ...Object.entries(phoneticWords).map(([letter,word])=>entry(letter,"Letters",word,`ITU/NATO phonetic word used to clearly transmit the letter ${letter}.`,{example:`${letter} as in ${word}.`})),
 ...Object.entries(numberWords).map(([number,word])=>entry(number,"Numbers",word,`Standard spoken word used to clearly transmit the number ${number}.`,{example:`${number} is spoken as ${word}.`})),
 entry("Decimal","Numbers","Decimal","Spoken separator used for a decimal point in a frequency.",{example:"14.250 may be spoken fourteen decimal two five zero."}),
 entry("Figure","Numbers","Figure","Word sometimes used before a number to make it clear that digits follow.",{example:"Figure five nine."})
];
