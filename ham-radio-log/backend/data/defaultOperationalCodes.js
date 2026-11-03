const policeSource={sourceName:"NYPD Police Field Communications",sourceUrl:"https://a860-gpp.nyc.gov/concern/nyc_government_publications/sb397902n?locale=en",jurisdiction:"New York City - NYPD",notes:"Confirm current meaning against the latest NYPD Patrol Guide and communications directives."};
const coastGuardSource={sourceName:"U.S. Coast Guard Navigation Center",sourceUrl:"https://www.navcen.uscg.gov/us-vhf-channel-information",jurisdiction:"United States marine VHF"};
const fccMarineSource={sourceName:"FCC 47 CFR Part 80",sourceUrl:"https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-80",jurisdiction:"United States maritime services"};
const ituSource={sourceName:"ITU Radiocommunication Sector",sourceUrl:"https://www.itu.int/rec/R-REC-M.1677/en",jurisdiction:"International"};

export const defaultOperationalCodes=[
 {service:"police",code:"10-1",title:"Call Your Command",meaning:"Call or contact your command.",category:"Command",...policeSource},
 {service:"police",code:"10-2",title:"Return to Your Command",meaning:"Return to your assigned command.",category:"Command",...policeSource},
 {service:"police",code:"10-3",title:"Call Dispatcher by Telephone",meaning:"Contact the dispatcher by telephone.",category:"Contact",...policeSource},
 {service:"police",code:"10-4",title:"Acknowledgment",meaning:"Message received or understood.",category:"Radio procedure",...policeSource},
 {service:"police",code:"10-5",title:"Repeat Message",meaning:"Repeat the previous radio message.",category:"Radio procedure",...policeSource},
 {service:"police",code:"10-6",title:"Stand By",meaning:"Stand by and await further radio traffic.",category:"Radio procedure",...policeSource},
 {service:"police",code:"10-7",title:"Verify Address",meaning:"Verify the reported address or location.",category:"Location",...policeSource},
 {service:"police",code:"10-10",title:"Possible Crime",meaning:"Report of a possible crime; the specific type follows the signal.",category:"Incident",...policeSource},
 {service:"police",code:"10-11",title:"Alarm",meaning:"Alarm condition or alarm activation.",category:"Incident",...policeSource},
 {service:"police",code:"10-13",title:"Officer Needs Assistance",meaning:"Police officer requires immediate assistance.",category:"Emergency",...policeSource},
 {service:"police",code:"10-15",title:"Prisoner in Custody",meaning:"A prisoner is in police custody.",category:"Custody",...policeSource},
 {service:"police",code:"10-30",title:"Robbery in Progress",meaning:"Robbery reported in progress.",category:"Crime in progress",...policeSource},
 {service:"police",code:"10-31",title:"Burglary in Progress",meaning:"Burglary reported in progress.",category:"Crime in progress",...policeSource},
 {service:"police",code:"10-34",title:"Assault in Progress",meaning:"Assault reported in progress.",category:"Crime in progress",...policeSource},
 {service:"police",code:"10-52",title:"Dispute",meaning:"Dispute requiring police response.",category:"Incident",...policeSource},
 {service:"police",code:"10-53",title:"Vehicle Accident",meaning:"Vehicle accident or collision.",category:"Traffic",...policeSource},
 {service:"police",code:"10-54",title:"Ambulance Case",meaning:"Incident requiring ambulance or medical response.",category:"Medical",...policeSource},
 {service:"police",code:"10-75",title:"Fire",meaning:"Fire condition reported.",category:"Fire",...policeSource},
 {service:"police",code:"10-84",title:"Arrived at Scene",meaning:"Unit has arrived at the assigned scene.",category:"Unit status",...policeSource},
 {service:"police",code:"10-85",title:"Additional Unit Required",meaning:"Request for an additional unit.",category:"Assistance",...policeSource},
 {service:"marine",code:"VHF 06",title:"Intership Safety",meaning:"Intership safety communications on 156.300 MHz.",category:"VHF channel",...coastGuardSource},
 {service:"marine",code:"VHF 13",title:"Bridge-to-Bridge",meaning:"Navigation safety and bridge-to-bridge communications on 156.650 MHz.",category:"VHF channel",...coastGuardSource},
 {service:"marine",code:"VHF 16",title:"Distress, Safety, and Calling",meaning:"International distress, safety, and calling channel on 156.800 MHz.",category:"VHF channel",...coastGuardSource},
 {service:"marine",code:"VHF 22A",title:"Coast Guard Liaison",meaning:"Primary United States Coast Guard liaison channel on 157.100 MHz after contact on Channel 16.",category:"VHF channel",...coastGuardSource},
 {service:"marine",code:"MAYDAY",title:"Distress Call",meaning:"Indicates grave and imminent danger requiring immediate assistance.",category:"Priority call",...fccMarineSource},
 {service:"marine",code:"PAN-PAN",title:"Urgency Call",meaning:"Indicates an urgent message concerning the safety of a person or vessel without immediate grave danger.",category:"Priority call",...fccMarineSource},
 {service:"marine",code:"SECURITE",title:"Safety Call",meaning:"Introduces an important navigational or meteorological safety message.",category:"Priority call",...fccMarineSource},
 {service:"marine",code:"SOS",title:"Morse Distress Signal",meaning:"International Morse distress signal: three dots, three dashes, three dots sent as one signal.",category:"Distress signal",...ituSource}
];

export const referenceOrganizations=[
 {name:"ARRL",role:"Amateur-radio education, operating guidance, and advocacy",url:"https://www.arrl.org/"},
 {name:"FCC Amateur Radio Service",role:"United States amateur-radio rules in 47 CFR Part 97",url:"https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-97"},
 {name:"Gordon West Radio School",role:"Amateur-radio license and Morse training resources",url:"https://www.gordonwestradioschool.com/main/page_training_resources.html"},
 {name:"ITU Radiocommunication Sector",role:"International radio recommendations and Morse specifications",url:"https://www.itu.int/rec/R-REC-M.1677/en"},
 {name:"APCO International",role:"Public-safety communications standards and historical ten-signal context",url:"https://www.apcointl.org/"},
 {name:"U.S. Coast Guard Navigation Center",role:"United States marine VHF channel information",url:"https://www.navcen.uscg.gov/us-vhf-channel-information"}
];
