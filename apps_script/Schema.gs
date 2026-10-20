/**
 * Tobago Event Inventory — record schema.
 * Each entry in SCHEMA.cols is one tab of the data spreadsheet; its fields are the columns.
 * SCHEMA.look holds the default drop-down lists. The live lists are kept on the Lookups tab
 * of the spreadsheet: change them there only by team decision.
 * Generated from the Event Inventory prototype (Draft 0.6, 8 October 2026).
 */
var SCHEMA = {
 "look": {
  "event_type": [
   "Landslide",
   "Rockfall",
   "Debris flow",
   "Flash flood",
   "River flood",
   "Urban / surface-water flood",
   "Coastal overtopping / flooding",
   "Coastal erosion episode",
   "Road closure",
   "Wildfire / bush fire",
   "Sargassum influx",
   "Drought impact",
   "Extreme heat impact",
   "Saltwater intrusion report",
   "Wind damage",
   "Storm surge flooding",
   "Coral bleaching / marine heatwave",
   "Climate-sensitive disease outbreak",
   "Oil spill",
   "Earthquake impact",
   "Tsunami",
   "Other"
  ],
  "trigger": [
   "Heavy rainfall",
   "Tropical storm / hurricane",
   "Severe local storm",
   "Swell / high waves",
   "High tide",
   "Dry spell / drought",
   "Earthquake",
   "Human activity (cutting, drainage, burning)",
   "Unknown"
  ],
  "date_precision": [
   "Exact day",
   "Within a week",
   "Month",
   "Year",
   "Approximate"
  ],
  "parish": [
   "St. Andrew",
   "St. David",
   "St. George",
   "St. John",
   "St. Mary",
   "St. Patrick",
   "St. Paul"
  ],
  "location_precision": [
   "GPS / RTK (< 10 m)",
   "Road chainage (< 100 m)",
   "Village or landmark (< 1 km)",
   "Parish only"
  ],
  "yes_no": [
   "Y",
   "N",
   "Unknown"
  ],
  "verification_status": [
   "Reported",
   "Desk-verified",
   "Partner-observed",
   "Field-verified",
   "Duplicate",
   "Rejected"
  ],
  "confidence": [
   "High",
   "Medium",
   "Low"
  ],
  "source_type": [
   "TEMA report",
   "Division of Infrastructure log",
   "WASA record",
   "Met Service record",
   "News article",
   "Social media post",
   "Community interview",
   "WhatsApp or messaging app",
   "Unit field visit (form THA-FV-01)",
   "Partner field monitoring",
   "UAS / drone survey",
   "Satellite image",
   "Video",
   "Photo or image",
   "Online report or dataset",
   "Other"
  ],
  "reliability": [
   "Official record",
   "Media",
   "Community",
   "Partner field data",
   "Unit observation"
  ],
  "sector": [
   "Social: Housing",
   "Social: Education",
   "Social: Health",
   "Social: Culture and heritage",
   "Productive: Agriculture, livestock and fisheries",
   "Productive: Tourism",
   "Productive: Commerce and industry",
   "Infrastructure: Transport",
   "Infrastructure: Water and sanitation",
   "Infrastructure: Electricity",
   "Infrastructure: Telecommunications",
   "Cross-cutting: Environment and ecosystems",
   "Cross-cutting: Governance and public services"
  ],
  "unit": [
   "count",
   "m",
   "m2",
   "m3",
   "ha",
   "km",
   "households",
   "days"
  ],
  "damage_state": [
   "Partially damaged",
   "Destroyed",
   "Disrupted (no physical damage)"
  ],
  "value_type": [
   "Damage (repair or replacement)",
   "Loss (income forgone)",
   "Additional cost (clean-up, response, temporary measures)"
  ],
  "valuation": [
   "Reported cost",
   "Quantity × unit cost",
   "Expert estimate"
  ],
  "effect_variable": [
   "Deaths",
   "Missing",
   "Injured or ill",
   "Directly affected",
   "Evacuated",
   "Relocated",
   "Livelihood disrupted (households)"
  ],
  "sex": [
   "Female",
   "Male",
   "Unknown"
  ],
  "age_group": [
   "0–14",
   "15–64",
   "65+",
   "Unknown"
  ],
  "disability": [
   "Yes",
   "No",
   "Unknown"
  ],
  "climate_flag": [
   "Climate-related",
   "Not climate-related",
   "Unclear"
  ],
  "nel_category": [
   "Life",
   "Health",
   "Human mobility",
   "Territory (land lost)",
   "Cultural heritage",
   "Local and traditional knowledge",
   "Societal and cultural identity",
   "Biodiversity",
   "Ecosystem services"
  ],
  "severity": [
   "Low",
   "Medium",
   "High"
  ],
  "permanence": [
   "Temporary",
   "Long-lasting",
   "Permanent"
  ],
  "evidence_type": [
   "Community session",
   "Interview",
   "Field observation",
   "Document",
   "Survey"
  ],
  "ecosystem": [
   "Coral reef",
   "Seagrass",
   "Mangrove / wetland",
   "Beach / dune",
   "Rocky shore",
   "Forest",
   "River / riparian",
   "Other"
  ],
  "condition": [
   "Good",
   "Fair",
   "Poor",
   "Unknown"
  ],
  "slow_hazard": [
   "Sea-level rise",
   "Coastal erosion",
   "Saltwater intrusion",
   "Drought / drying",
   "Rising temperature",
   "Ocean acidification",
   "Marine heatwave / bleaching",
   "Sargassum (parallel stream)"
  ],
  "funder_type": [
   "THA",
   "Central Government",
   "Parametric insurance (CCRIF)",
   "Private insurance",
   "Households / businesses",
   "NGO / CBO / church",
   "International donor or fund",
   "Other"
  ],
  "funding_purpose": [
   "Emergency response",
   "Recovery",
   "Reconstruction",
   "Relief or compensation payments",
   "Adaptation after the event"
  ],
  "recovery_status": [
   "Not started",
   "In progress",
   "Recovered",
   "Replaced elsewhere",
   "Abandoned",
   "Unknown"
  ],
  "data_origin": [
   "Unit field observation",
   "Partner field monitoring",
   "Official record (desk)",
   "Media or social media",
   "Community report",
   "Remote sensing (satellite or drone, no site visit)"
  ],
  "check_type": [
   "Verification visit (checks an existing record)",
   "First-hand observation (team saw the event)",
   "Follow-up visit (condition or recovery)"
  ],
  "check_outcome": [
   "Confirmed",
   "Confirmed with corrections",
   "Not found / cannot confirm",
   "Different event type",
   "Duplicate of another record"
  ],
  "measure_method": [
   "Visual estimate",
   "Tape or measuring staff",
   "GPS walk-over",
   "Drone (UAS) survey",
   "Other"
  ],
  "condition_now": [
   "Still present",
   "Partly cleared or repaired",
   "Cleared or repaired",
   "Worse than reported",
   "Unknown"
  ],
  "stoplight": [
   "Green",
   "Yellow",
   "Red"
  ],
  "he_hazard": [
   "Heavy rainfall",
   "Tropical storm / hurricane",
   "Severe local storm",
   "Swell / high waves",
   "Storm surge",
   "High tide / king tide",
   "Dry spell / drought",
   "Extreme heat",
   "Marine heatwave",
   "Sargassum influx wave",
   "Earthquake",
   "Tsunami",
   "Other"
  ],
  "met_match": [
   "Matched to a hazardous event",
   "No impacts recorded in Tobago",
   "Not yet checked"
  ],
  "authority": [
   "Mandated agency, within its mandate",
   "Other official",
   "Not official"
  ],
  "geodata_type": [
   "Points",
   "Lines or areas",
   "Map image or PDF",
   "Whole dataset"
  ],
  "gis_status": [
   "Not yet with the GIS Specialist",
   "With the GIS Specialist",
   "Checked and loaded to the GeoPackage",
   "Not usable (explain in notes)"
  ]
 },
 "tmap": {
  "Heavy rainfall": "Climate-related",
  "Tropical storm / hurricane": "Climate-related",
  "Severe local storm": "Climate-related",
  "Swell / high waves": "Climate-related",
  "High tide": "Climate-related",
  "Dry spell / drought": "Climate-related",
  "Earthquake": "Not climate-related",
  "Human activity (cutting, drainage, burning)": "Not climate-related",
  "Unknown": "Unclear"
 },
 "cols": [
  {
   "key": "events",
   "name": "Events",
   "one": "event",
   "id": "event_id",
   "pref": "EV-{Y}-",
   "pad": 4,
   "prio": "1",
   "feeds": "Hazard map validation; susceptibility training; screening likelihood and consequence; impact chains; DAPP signposts",
   "when": "Every event. Fill all Essential fields; others when known. Every record needs at least one impact field.",
   "fields": [
    {
     "k": "event_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Unique ID: EV-YYYY-NNNN. YYYY is the year the event happened (year of date_start) when the ID is issued. Leave blank and it is numbered from the start date when you save. Never changed afterwards, even if the date is corrected.",
     "f": "Every CRVA use: links the record to maps, impact chains and the loss and damage database",
     "x": "EV-2027-0001"
    },
    {
     "k": "record_uuid",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Universally unique ID, filled automatically when the record is loaded to the GeoPackage or created in QField (uuid()). Never edit. Used to link records across systems such as DELTA Resilience.",
     "f": "Exchange with ODPM and DELTA Resilience (automatic)",
     "x": "(auto)"
    },
    {
     "k": "is_example",
     "t": "list",
     "l": "yes_no",
     "r": true,
     "p": "1",
     "h": "Y for training examples. Delete example rows before real use.",
     "f": "QA: keeps training rows out of every CRVA count",
     "x": "N"
    },
    {
     "k": "event_type",
     "t": "list",
     "l": "event_type",
     "r": true,
     "p": "1",
     "h": "What happened. One row per type per location.",
     "f": "Screening matrix likelihood (how often each hazard happens); hazard map validation; impact chains",
     "x": "Landslide"
    },
    {
     "k": "sargassum_flag",
     "t": "list",
     "l": "stoplight",
     "r": false,
     "p": "1",
     "h": "Sargassum events only: the coastal unit's stoplight class (TTSMP). Record only Yellow and Red strandings, and Green ones with a reported impact (facility or landing site blocked, health complaints, nesting affected, business losses, clean-up spending).",
     "f": "Sargassum stream: entry rule; magnitude M of the sargassum hazard score",
     "x": "Red"
    },
    {
     "k": "stranding_ref",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Sargassum events only: observation ID(s) from the coastal unit's Sargassum Stranding Record, e.g. BCH-03-20261015; separate with semicolons.",
     "f": "Links to the full stranding record (frequency and persistence come from there, not from event counts)",
     "x": "BCH-03-20261015"
    },
    {
     "k": "event_subtype",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "More detail, e.g. debris slide, slump, culvert overflow.",
     "f": "Landslide and flood susceptibility (type of slide or flood)",
     "x": "Debris slide"
    },
    {
     "k": "parent_event_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "ID of the event that caused this one. Records cascades, e.g. landslide → road closure.",
     "f": "Impact chains: measures cascades and shared nodes (e.g. landslide → road closure, IC1)",
     "x": "EV-2027-0001"
    },
    {
     "k": "hazardous_event_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "ID from the Hazardous events tab for the storm, rain event, swell or dry spell that caused this record. Required when the trigger is Heavy rainfall, Tropical storm / hurricane or Swell / high waves: add the hazardous event first.",
     "f": "Thresholds and signposts; storm-level frequency; Sendai and DELTA reporting. Essential for rainfall, storm and swell triggers",
     "x": "HE-2027-001"
    },
    {
     "k": "glide_no",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": "GLIDE number for large or named events, if one was issued.",
     "f": "Cross-reference to global databases for large events",
     "x": "TC-2027-000123-TTO"
    },
    {
     "k": "trigger",
     "t": "list",
     "l": "trigger",
     "r": true,
     "p": "1",
     "h": "Main cause.",
     "f": "Rainfall and swell thresholds; hazard drivers in the screening matrix; sets climate_related",
     "x": "Heavy rainfall"
    },
    {
     "k": "trigger_event_name",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Named storm or weather system, if any.",
     "f": "Links events to named storms in the hurricane hazard work",
     "x": "Tropical Storm X"
    },
    {
     "k": "climate_related",
     "t": "auto",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Filled automatically from the trigger: Climate-related, Not climate-related or Unclear (see Lookups). Do not type here.",
     "f": "Separates climate from non-climate hazards in the screening matrix and in loss and damage totals (automatic)",
     "x": "Climate-related"
    },
    {
     "k": "significant",
     "t": "auto",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Filled automatically. Interim rule until open question I4 is settled (manual, Option A impact criteria): Yes if any death, any building destroyed, a road closed for more than 24 hours, or any THA spending on the event on the Response funding sheet. Do not type here.",
     "f": "Decides which events get Loss & damage detail (Human effects, Damage & losses, Ecosystem, Non-economic, Response funding); unit lead review",
     "x": "No"
    },
    {
     "k": "attribution_ref",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": "Reference to a published attribution study for this event (for example World Weather Attribution), if one exists. Leave blank otherwise; never infer attribution.",
     "f": "Loss and damage reporting only; not used in Tier 1",
     "x": ""
    },
    {
     "k": "date_start",
     "t": "date",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Date the event began (YYYY-MM-DD). If only month known, use the 1st and set date_precision.",
     "f": "Event frequency and seasonality for screening likelihood; trends for DAPP signposts",
     "x": "2027-11-12"
    },
    {
     "k": "date_end",
     "t": "date",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Date it ended, for floods, closures, Sargassum.",
     "f": "Duration of floods, closures and sargassum events",
     "x": "2027-11-13"
    },
    {
     "k": "date_precision",
     "t": "list",
     "l": "date_precision",
     "r": true,
     "p": "1",
     "h": "How exact the date is.",
     "f": "Decides which records are used for frequency and trend analysis",
     "x": "Exact day"
    },
    {
     "k": "parish",
     "t": "list",
     "l": "parish",
     "r": true,
     "p": "1",
     "h": "Parish where it happened.",
     "f": "Exposure and vulnerability summaries by parish; reporting",
     "x": "St. Paul"
    },
    {
     "k": "community",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Nearest village or community.",
     "f": "Community-level validation in parish sessions; vulnerability storylines",
     "x": "Roxborough"
    },
    {
     "k": "location_desc",
     "t": "long",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Plain description someone could find on the ground.",
     "f": "Lets the team find and field-verify the site",
     "x": "Windward Road, 300 m east of junction"
    },
    {
     "k": "easting",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "UTM Zone 20N easting (EPSG:32620), metres. *Required unless precision is Parish only.",
     "f": "Hazard map validation; landslide and flood susceptibility training points",
     "x": "763700"
    },
    {
     "k": "northing",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "UTM Zone 20N northing (EPSG:32620), metres.",
     "f": "Hazard map validation; landslide and flood susceptibility training points",
     "x": "1244900"
    },
    {
     "k": "location_precision",
     "t": "list",
     "l": "location_precision",
     "r": true,
     "p": "1",
     "h": "How exact the location is. Low-precision points are not used to train susceptibility models.",
     "f": "Filter: only GPS and road-chainage records train susceptibility models",
     "x": "GPS / RTK (< 10 m)"
    },
    {
     "k": "coords_from",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Where the easting and northing came from: Unit GPS, a field check ID (FC-…), or the source ID (SRC-…) of an agency's geodata. Coordinates from agency geodata go on an event only after the GIS Specialist has processed that source; they also set location_precision.",
     "f": "Traceability of every location used for map validation and training",
     "x": "FC-2027-001"
    },
    {
     "k": "road_name",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Road affected, if any.",
     "f": "Isolation impact chain (IC1); road closure log (d056)",
     "x": "Windward Road"
    },
    {
     "k": "road_chainage_km",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Distance along the road from its start point, if known.",
     "f": "Places road events precisely for IC1 and landslide mapping",
     "x": "24.3"
    },
    {
     "k": "site_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Coastal Site ID from the Site & Asset Register (Form A/B).",
     "f": "Links coastal events to the Site and Asset Register; Tier 2 hotspot selection",
     "x": "S014"
    },
    {
     "k": "asset_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Asset ID if a specific structure was affected.",
     "f": "Links damage to a specific defence or asset (Form A)",
     "x": "S014-A01"
    },
    {
     "k": "length_m",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Length of slide scar, flood reach or eroded shoreline.",
     "f": "Hazard magnitude for landslide and erosion mapping",
     "x": "35"
    },
    {
     "k": "width_m",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Width of slide or flooded area.",
     "f": "Hazard magnitude for landslide mapping",
     "x": "12"
    },
    {
     "k": "area_m2",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Area affected (fires, floods, Sargassum).",
     "f": "Hazard magnitude for floods, fires and sargassum",
     "x": "420"
    },
    {
     "k": "volume_m3",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Estimated volume of slide material or Sargassum.",
     "f": "Hazard magnitude for slides and sargassum",
     "x": "150"
    },
    {
     "k": "water_depth_m",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Maximum observed flood depth.",
     "f": "Flood and overtopping map validation",
     "x": "0.4"
    },
    {
     "k": "road_closed",
     "t": "list",
     "l": "yes_no",
     "r": false,
     "p": "1",
     "h": "Was a road fully or partly closed?",
     "f": "Isolation impact chain (IC1): how often communities are cut off",
     "x": "Y"
    },
    {
     "k": "closure_hours",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Hours until the road reopened.",
     "f": "Isolation impact chain (IC1): how long; DAPP signpost for road access",
     "x": "18"
    },
    {
     "k": "people_affected",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "People affected (estimate; say how in notes).",
     "f": "Screening matrix consequence score; impact chain validation",
     "x": "1200"
    },
    {
     "k": "people_displaced",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "People who left their homes.",
     "f": "Consequence and coping capacity (shelter use)",
     "x": "0"
    },
    {
     "k": "people_relocated",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "People moved permanently or long term (DesInventar 'relocated').",
     "f": "Long-term consequence; Sendai B-1",
     "x": "0"
    },
    {
     "k": "livelihoods_disrupted",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Households whose income was disrupted or lost (fishers, vendors, farmers, guest houses).",
     "f": "Livelihood impact chain (IC3, fishing and tourism households)",
     "x": "3"
    },
    {
     "k": "injuries",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Number injured.",
     "f": "Consequence (health); Sendai B-2",
     "x": "0"
    },
    {
     "k": "deaths",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Number of deaths.",
     "f": "Screening matrix consequence score (high-consequence flag)",
     "x": "0"
    },
    {
     "k": "missing",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Number of people missing.",
     "f": "Consequence; Sendai A-3",
     "x": "0"
    },
    {
     "k": "disaggregation",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Deaths, injuries and people affected by sex, age group (under 15, 15–64, 65+) and disability, where known. Example: deaths F1 M0; injured 65+: 2.",
     "f": "Social vulnerability: which groups are hit hardest",
     "x": ""
    },
    {
     "k": "buildings_damaged",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Buildings damaged.",
     "f": "Screening matrix consequence; exposure validation",
     "x": "2"
    },
    {
     "k": "buildings_destroyed",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Buildings destroyed.",
     "f": "Screening matrix consequence; exposure validation",
     "x": "0"
    },
    {
     "k": "dwellings_damaged",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Of the buildings damaged, how many are homes.",
     "f": "Housing exposure validation; Sendai B-3",
     "x": "1"
    },
    {
     "k": "dwellings_destroyed",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Of the buildings destroyed, how many are homes.",
     "f": "Housing exposure validation; Sendai B-4",
     "x": "0"
    },
    {
     "k": "education_facilities_damaged",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Schools and other education buildings damaged or destroyed.",
     "f": "Critical facility exposure; Sendai D-3",
     "x": "0"
    },
    {
     "k": "health_facilities_damaged",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Health centres, hospitals and clinics damaged or destroyed.",
     "f": "Critical facility exposure; Sendai D-2",
     "x": "0"
    },
    {
     "k": "roads_damaged_m",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Length of road damaged or destroyed, metres.",
     "f": "Road exposure and IC1; Sendai D-4",
     "x": "35"
    },
    {
     "k": "crops_ha",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Area of crops damaged or lost, hectares.",
     "f": "Agriculture sector consequence",
     "x": "0"
    },
    {
     "k": "livestock_lost",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Livestock lost (count; say which animals in notes).",
     "f": "Agriculture sector consequence",
     "x": "0"
    },
    {
     "k": "boats_damaged",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Fishing boats damaged or destroyed.",
     "f": "Fisheries consequence (IC3)",
     "x": "0"
    },
    {
     "k": "heritage_damaged",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Cultural heritage or sites of community value damaged (buildings, burial grounds, monuments).",
     "f": "Values-at-risk layer (d068)",
     "x": ""
    },
    {
     "k": "facilities_affected",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Critical facilities affected (school, health centre, shelter, intake).",
     "f": "Critical facility exposure validation (d039)",
     "x": "None"
    },
    {
     "k": "utilities_affected",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Water, power, telecoms cut, and for how long.",
     "f": "Service disruption; coping capacity",
     "x": "Power, 6 h"
    },
    {
     "k": "damage_desc",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Short description of damage. If there is no countable impact, say so here, e.g. 'No impact beyond the hazard: open grassland burned'; this counts as the record's impact field.",
     "f": "Context for consequence scoring",
     "x": "Lane blocked, culvert buried"
    },
    {
     "k": "est_cost_ttd",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Estimated cost of direct physical damage (repair or replacement), TT$.",
     "f": "Loss and damage database (d034); economic consequence",
     "x": "85000"
    },
    {
     "k": "est_loss_ttd",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Estimated losses, TT$: lost income, extra costs and clean-up, kept separate from damage (DesInventar and PDNA/DaLA practice).",
     "f": "Loss and damage database (d034); economic consequence",
     "x": "12000"
    },
    {
     "k": "price_year",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Year the TT$ values in est_cost_ttd and est_loss_ttd are priced in, so they can be adjusted for inflation.",
     "f": "Makes costs from different years comparable",
     "x": "2025"
    },
    {
     "k": "cost_source",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Where the cost figure came from.",
     "f": "Confidence in cost figures",
     "x": "Division of Infrastructure"
    },
    {
     "k": "data_origin",
     "t": "list",
     "l": "data_origin",
     "r": true,
     "p": "1",
     "h": "How the information first reached the unit: who saw or measured it. This is not verification. Field data collected by a partner (for example the coastal unit's beach photos) is 'Partner field monitoring'.",
     "f": "Confidence weighting; separates partner field data from the team's own field checks",
     "x": "Partner field monitoring"
    },
    {
     "k": "origin_agency",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Who collected or first reported it, e.g. the coastal unit (weekly beach photos), Division of Infrastructure, TEMA. Needed when data_origin is Partner field monitoring.",
     "f": "Audit trail; who to ask for the partner's raw photos or measurements",
     "x": "Coastal unit, weekly beach photo log"
    },
    {
     "k": "verification_status",
     "t": "list",
     "l": "verification_status",
     "r": true,
     "p": "1",
     "h": "Reported (not yet confirmed) → Desk-verified (one record from the mandated agency, about a claim within its mandate; or two independent sources; a source that repeats another never counts as the second) → Partner-observed (a partner's own field data; the CRVA team has not visited) → Field-verified (set only by a confirming field check by the CRVA team, on the Field checks tab).",
     "f": "Only Desk-verified, Partner-observed and Field-verified records are used in CRVA analysis",
     "x": "Field-verified"
    },
    {
     "k": "verified_by",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "CRVA team member(s) who verified. Filled from the field check when one confirms the record.",
     "f": "Audit trail",
     "x": "Research Associate 1"
    },
    {
     "k": "verification_date",
     "t": "date",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Date verified.",
     "f": "Audit trail",
     "x": "2027-11-20"
    },
    {
     "k": "field_check_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Visit ID (FC-YYYY-NNN) of the field check that confirmed this record. Filled automatically when a confirming field check is saved.",
     "f": "Audit trail: links a Field-verified record to its field check",
     "x": "FC-2027-001"
    },
    {
     "k": "photo_ids",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Photo file names, separated by semicolons. For field-verified records, the field check holds the visit photos.",
     "f": "Evidence for field verification and validation",
     "x": "EV0001_01.jpg; EV0001_02.jpg"
    },
    {
     "k": "confidence",
     "t": "list",
     "l": "confidence",
     "r": true,
     "p": "1",
     "h": "Overall confidence in the record.",
     "f": "Weights records in validation and trend analysis",
     "x": "High"
    },
    {
     "k": "duplicate_of",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "If status is Duplicate, the ID of the record it duplicates.",
     "f": "QA: stops double counting in frequency and consequence",
     "x": ""
    },
    {
     "k": "register_ids",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Data register entries this record feeds.",
     "f": "Links records to Risk Data Register datasets",
     "x": "d031; d056"
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Anything else, including how estimates were made.",
     "f": "How estimates were made",
     "x": ""
    },
    {
     "k": "recorded_by",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Who entered the record.",
     "f": "Audit trail",
     "x": "Research Associate 1"
    },
    {
     "k": "recorded_date",
     "t": "date",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Date entered.",
     "f": "Audit trail",
     "x": "2027-11-14"
    }
   ]
  },
  {
   "key": "sources",
   "name": "Sources",
   "one": "source",
   "id": "source_id",
   "pref": "SRC-",
   "pad": 4,
   "prio": "1",
   "feeds": "Confidence and verification of every record",
   "when": "Every event: at least one source.",
   "fields": [
    {
     "k": "source_id",
     "t": "text",
     "r": true,
     "p": "1",
     "h": "SRC-NNNN"
    },
    {
     "k": "is_example",
     "t": "list",
     "l": "yes_no",
     "r": true,
     "p": "1",
     "h": "Y for training examples."
    },
    {
     "k": "source_type",
     "t": "list",
     "l": "source_type",
     "r": true,
     "p": "1",
     "h": "WhatsApp or messaging app: a message or photo sent by a member of the public. Authority is Not official. Publisher is 'Member of the public via WhatsApp', never the sender's name or number. One source per sender per event; a forwarded message repeats its original and is never a new source. Save the source, then use Attach photos: the photos go to the restricted Climate Unit folder (never the Commons) and the WA reference and file names are filled in for you. Put a short note of what the message said in notes, without names or numbers."
    },
    {
     "k": "title",
     "t": "text",
     "r": true,
     "p": "1",
     "h": "Title or short description of the document, log, article or interview."
    },
    {
     "k": "publisher",
     "t": "text",
     "r": false,
     "p": "1",
     "h": "Who produced it: agency, newspaper, partner or 'Member of the public via WhatsApp'. Never a private person's name."
    },
    {
     "k": "agency_record_ids",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "The originating agency's own IDs for this record, so it can be traced back: field form number, observation ID, photo numbers, situation report number. Separate several with semicolons, e.g. BCH-02-20260804; IMG_0412–0418. Use reference_or_url for where to find the document.",
     "f": "Traces each source back to the partner's or agency's original form, photo or report"
    },
    {
     "k": "source_date",
     "t": "date",
     "r": true,
     "p": "1",
     "h": ""
    },
    {
     "k": "reference_or_url",
     "t": "text",
     "r": false,
     "p": "2",
     "h": "Where to find the document if it is not online: file, folder, page. Put the agency's own record numbers in agency_record_ids and web addresses in the link field."
    },
    {
     "k": "link_url",
     "t": "url",
     "r": false,
     "p": "2",
     "h": "Web address of the article, video, social media post, photo or online report. Paste the full link, starting with https://. Use the archived copy if the original may disappear."
    },
    {
     "k": "reliability",
     "t": "list",
     "l": "reliability",
     "r": false,
     "p": "2",
     "h": ""
    },
    {
     "k": "authority",
     "t": "list",
     "l": "authority",
     "r": false,
     "p": "1",
     "h": "Mandated agency, within its mandate: the record comes from the agency mandated for this kind of claim, and is about that claim. Met Service: rainfall, wind, warnings, storm tracks. TEMA / ODPM: disaster declarations, people affected, shelters, official damage assessments. Division of Infrastructure: road closures and road damage. WASA: water supply outages. IMA: marine heatwaves, coral bleaching, marine disease, sargassum science and offshore monitoring. Coastal Zone Management Unit: beach and coastal monitoring, sargassum stranding flags (TTSMP). One such record makes an event Desk-verified on its own. Other official: any other government record. Not official: media, social media, community, other.",
     "f": "Desk-verified rule: one authoritative record within its mandate, or two independent sources"
    },
    {
     "k": "repeats_source_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "If this source repeats or is built from another source (a news story from a TEMA report, a post sharing a Met Service bulletin), give that source's ID, or the original's reference if it is not in the inventory. A repeat never counts as a second independent source. Reposts and shares of the same post are not new sources: add their links to the original's notes.",
     "f": "Desk-verified rule: stops a copy counting as independent"
    },
    {
     "k": "original_held",
     "t": "list",
     "l": "yes_no",
     "r": false,
     "p": "1",
     "h": "Only with repeats_source_id. Y: the original is entered as a source; cite it on the event too. N: the original is not held, so this copy stands in for it as weaker evidence; ask the agency for the original.",
     "f": "Shows where to request the original record"
    },
    {
     "k": "has_geodata",
     "t": "list",
     "l": "yes_no",
     "r": false,
     "p": "1",
     "h": "Does this source include geospatial data: coordinates, flood extents or other shapes, a map, or a GIS layer? If Y, send it to the GIS Specialist before using it anywhere else.",
     "f": "Hazard map validation and susceptibility training, once the GIS Specialist has processed it"
    },
    {
     "k": "geodata_type",
     "t": "list",
     "l": "geodata_type",
     "r": false,
     "p": "1",
     "h": "Points: a location per incident. Lines or areas: flood extents, affected areas, road sections. Map image or PDF: a picture, to be georeferenced. Whole dataset: a layer of many incidents, which also gets a Risk Data Register entry.",
     "f": "Tells the GIS Specialist what processing is needed"
    },
    {
     "k": "geodata_file",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "File name(s) as received, e.g. TEMA_flood_extent_20271112.kml.",
     "f": "Audit trail"
    },
    {
     "k": "geodata_link",
     "t": "url",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Link to the file in the Commons, the team's register of all data held. For WhatsApp location pins, link to the restricted Drive folder instead: WhatsApp material never goes in the Commons. Until the file is stored, leave blank and say in notes where it is.",
     "f": "Single stored copy of the file"
    },
    {
     "k": "original_crs",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Coordinate system the file came in, e.g. WGS84 latitude/longitude (EPSG:4326). The GIS Specialist converts it to UTM 20N (EPSG:32620).",
     "f": "CRS conversion by the GIS Specialist"
    },
    {
     "k": "gis_status",
     "t": "list",
     "l": "gis_status",
     "r": false,
     "p": "1",
     "h": "Set by the GIS Specialist. Coordinates or shapes from this source are used on events only once it reads Checked and loaded to the GeoPackage.",
     "f": "Stops unchecked geodata entering the CRVA"
    },
    {
     "k": "sharing_terms",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Any limits the agency placed on use or sharing. Restricted data stays in the Commons and the GeoPackage, not on this shared page.",
     "f": "Data-sharing compliance"
    },
    {
     "k": "notes",
     "t": "long",
     "r": false,
     "p": "2",
     "h": ""
    }
   ]
  },
  {
   "key": "field_checks",
   "name": "Field checks",
   "one": "field check",
   "id": "visit_id",
   "pref": "FC-{Y}-",
   "pad": 3,
   "prio": "1",
   "feeds": "Field-verified status of events; field-confirmed locations and sizes for hazard map validation and susceptibility training",
   "when": "Every site visit by the CRVA team to check an event (form THA-FV-01). Partner field data goes on the Sources tab, not here.",
   "fields": [
    {
     "k": "visit_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Unique visit ID: FC-YYYY-NNN. Leave blank to get the next number.",
     "f": "Audit trail for every Field-verified record",
     "x": "FC-2027-001"
    },
    {
     "k": "is_example",
     "t": "list",
     "l": "yes_no",
     "r": true,
     "p": "1",
     "h": "Y for training examples.",
     "f": "QA: keeps training rows out of counts",
     "x": "N"
    },
    {
     "k": "event_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "The event this visit checks (EV- ID from the Events tab).",
     "f": "Links the visit to the event it verifies",
     "x": "EV-2027-0001"
    },
    {
     "k": "check_type",
     "t": "list",
     "l": "check_type",
     "r": true,
     "p": "1",
     "h": "Verification visit: the team goes out to check a record that came from someone else (a partner, the media, a report). First-hand observation: the team saw the event itself. Follow-up visit: condition or recovery.",
     "f": "Separates checks of others' reports from the team's own observations",
     "x": "Verification visit (checks an existing record)"
    },
    {
     "k": "visit_date",
     "t": "date",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Date of the visit.",
     "f": "Verification date of the event",
     "x": ""
    },
    {
     "k": "team",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "CRVA team members on the visit. At least one must be present for the check to count.",
     "f": "Audit trail; verified_by on the event",
     "x": "Research Associate 1; GIS Specialist"
    },
    {
     "k": "partner_present",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Partner staff who came along, e.g. coastal unit officer. Their presence does not replace a CRVA team member.",
     "f": "Shared fieldwork record with partners",
     "x": "Coastal unit officer"
    },
    {
     "k": "easting",
     "t": "number",
     "l": null,
     "r": true,
     "p": "1",
     "h": "GPS easting at the event, UTM Zone 20N (EPSG:32620).",
     "f": "Field-confirmed location for hazard map validation and susceptibility training",
     "x": "763712"
    },
    {
     "k": "northing",
     "t": "number",
     "l": null,
     "r": true,
     "p": "1",
     "h": "GPS northing at the event.",
     "f": "Field-confirmed location for hazard map validation and susceptibility training",
     "x": "1244893"
    },
    {
     "k": "gps_accuracy_m",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Accuracy shown by the GPS or phone, metres.",
     "f": "Location precision filter",
     "x": ""
    },
    {
     "k": "outcome",
     "t": "list",
     "l": "check_outcome",
     "r": true,
     "p": "1",
     "h": "Confirmed or Confirmed with corrections sets the event to Field-verified. Any other outcome leaves the event's status unchanged; open the event and set Duplicate or Rejected if needed.",
     "f": "Sets verification_status on the event",
     "x": ""
    },
    {
     "k": "corrections",
     "t": "long",
     "l": null,
     "r": false,
     "p": "1",
     "h": "What should change in the event record: location, date, size, type. Make the same change on the event.",
     "f": "Corrects hazard magnitude and location before analysis",
     "x": ""
    },
    {
     "k": "measure_method",
     "t": "list",
     "l": "measure_method",
     "r": false,
     "p": "2",
     "h": "How sizes were measured.",
     "f": "Confidence in hazard magnitude",
     "x": ""
    },
    {
     "k": "measurements",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Length, width, depth, volume, wrack-line height, staff readings.",
     "f": "Hazard magnitude (landslide, flood, erosion, sargassum)",
     "x": ""
    },
    {
     "k": "condition_now",
     "t": "list",
     "l": "condition_now",
     "r": false,
     "p": "2",
     "h": "State of the site on the visit date.",
     "f": "Recovery tracking; persistence of impacts",
     "x": ""
    },
    {
     "k": "photo_ids",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "At least two photos: a wide view and a close-up with a scale. Give their file names as stored in the Commons, separated by semicolons.",
     "f": "Evidence for verification and validation",
     "x": ""
    },
    {
     "k": "commons_photos_link",
     "t": "url",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Link to this visit's photos in the Commons (Field Work area). The photos are stored in the Commons, where the team tracks its field visits; the inventory only links to them. Open the visit in the Commons and copy its photos link.",
     "f": "Evidence for field verification, held once in the Commons",
     "x": ""
    },
    {
     "k": "evidence_link",
     "t": "url",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Other evidence, if any: a drone orthomosaic or a video (https://). Photos go in the Commons photos link above.",
     "f": "Evidence for verification and validation",
     "x": ""
    },
    {
     "k": "recorded_by",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Who entered this visit.",
     "f": "Audit trail",
     "x": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Anything else.",
     "f": "",
     "x": ""
    }
   ]
  },
  {
   "key": "hazardous_events",
   "name": "Hazardous events",
   "one": "hazardous event",
   "id": "hazardous_event_id",
   "pref": "HE-{Y}-",
   "pad": 3,
   "prio": "1",
   "feeds": "Rainfall and swell thresholds; links impacts to the driving event; Sendai and DELTA",
   "when": "One row per storm, rain spell, swell episode, dry spell or other physical event that caused impacts. Essential for heavy rainfall, storms and swell. Fill the hazard and start date first.",
   "fields": [
    {
     "k": "hazardous_event_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "HE-YYYY-NNN. Leave blank: it is numbered from the start date when you save. One row per storm, rain spell, swell episode, dry spell or other physical event. Never changed afterwards."
    },
    {
     "k": "record_uuid",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Filled automatically in the GeoPackage. Never edit."
    },
    {
     "k": "is_example",
     "t": "list",
     "l": "yes_no",
     "r": true,
     "p": "1",
     "h": "Y for training examples."
    },
    {
     "k": "hazard",
     "t": "list",
     "l": "he_hazard",
     "r": true,
     "p": "1",
     "h": "The physical event that caused the impacts: the weather, sea or earth event, not its effects. Pick Heavy rainfall, not Landslide or Flash flood; record landslides, floods and closures on the Events tab and link them here. Map to the 2025 UNDRR–ISC Hazard Information Profile in hip_name_or_code."
    },
    {
     "k": "hip_name_or_code",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Hazard Information Profile name or code (2025 list), agreed with ODPM."
    },
    {
     "k": "event_name",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Named storm or local name."
    },
    {
     "k": "wmo_che_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Hazardous event ID issued by the Met Service under WMO Cataloguing of Hazardous Events. Filled automatically when a row on the Met Service IDs tab is matched to this event; do not type here."
    },
    {
     "k": "glide_no",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "GLIDE number, if issued."
    },
    {
     "k": "date_start",
     "t": "date",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Start of the physical event."
    },
    {
     "k": "date_end",
     "t": "date",
     "l": null,
     "r": false,
     "p": "1",
     "h": "End of the physical event."
    },
    {
     "k": "max_24h_rain_mm",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Highest 24-hour rainfall at any Tobago gauge."
    },
    {
     "k": "max_wind_kt",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Highest sustained wind, knots."
    },
    {
     "k": "max_water_level_m",
     "t": "number",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Highest observed water level above datum, metres."
    },
    {
     "k": "warning_issued",
     "t": "list",
     "l": "yes_no",
     "r": false,
     "p": "2",
     "h": "Was an official warning issued before impacts?"
    },
    {
     "k": "warning_lead_time_h",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Hours between the warning and the first impact."
    },
    {
     "k": "source_ids",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Source IDs from the Sources sheet, separated by semicolons."
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    },
    {
     "k": "climate_related",
     "t": "list",
     "l": "climate_flag",
     "r": false,
     "p": "1",
     "h": "Climate-related, Not climate-related or Unclear. Used to report climate loss and damage separately."
    }
   ]
  },
  {
   "key": "met_ids",
   "name": "Met Service IDs",
   "one": "Met Service ID",
   "id": "met_record_id",
   "pref": "MS-",
   "pad": 3,
   "prio": "2",
   "feeds": "Links each hazardous event to the official Met Service / WMO hazardous event ID (open question I5); Sendai and DELTA exchange",
   "when": "When the Met Service shares its hazardous event IDs. One row per ID received, including events that caused no recorded impacts in Tobago.",
   "fields": [
    {
     "k": "met_record_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Row ID: MS-NNN. Leave blank to get the next number.",
     "f": "Audit trail",
     "x": "MS-001"
    },
    {
     "k": "is_example",
     "t": "list",
     "l": "yes_no",
     "r": true,
     "p": "1",
     "h": "Y for training examples.",
     "f": "QA: keeps training rows out of counts",
     "x": "N"
    },
    {
     "k": "wmo_che_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "The hazardous event ID exactly as the Met Service issued it (WMO Cataloguing of Hazardous Events). Copy it character for character.",
     "f": "Official ID for the hazardous event; exchange with ODPM, DELTA and the Met Service",
     "x": ""
    },
    {
     "k": "met_event_name",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Name or description the Met Service gives the event.",
     "f": "Matching to inventory records",
     "x": "Tropical Storm X"
    },
    {
     "k": "hazard",
     "t": "list",
     "l": "he_hazard",
     "r": true,
     "p": "1",
     "h": "Hazard type, from the same list as the Hazardous events tab.",
     "f": "Matching to inventory records",
     "x": "Heavy rainfall"
    },
    {
     "k": "date_start",
     "t": "date",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Start date as given by the Met Service.",
     "f": "Matching to inventory records",
     "x": ""
    },
    {
     "k": "date_end",
     "t": "date",
     "l": null,
     "r": false,
     "p": "1",
     "h": "End date as given by the Met Service.",
     "f": "Matching to inventory records",
     "x": ""
    },
    {
     "k": "match_status",
     "t": "list",
     "l": "met_match",
     "r": true,
     "p": "1",
     "h": "Matched: this ID belongs to a hazardous event in the inventory (fill hazardous_event_id). No impacts recorded: the event affected Tobago's weather but no impacts are on record. Not yet checked: not compared yet.",
     "f": "Shows which Met Service events have caused recorded impacts",
     "x": "Not yet checked"
    },
    {
     "k": "hazardous_event_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "The inventory's own HE- ID for the same event. When you save, the Met Service ID is copied to that hazardous event's wmo_che_id. The HE- ID itself never changes.",
     "f": "Links inventory impacts to the official event ID",
     "x": "HE-2027-001"
    },
    {
     "k": "date_received",
     "t": "date",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Date the unit received this ID.",
     "f": "Audit trail",
     "x": ""
    },
    {
     "k": "received_from",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Met Service office, contact role or document it came in (no private names).",
     "f": "Audit trail; who to ask",
     "x": "TTMS, letter ref."
    },
    {
     "k": "reference_or_url",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "File, letter or web reference for the list of IDs.",
     "f": "Audit trail",
     "x": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": "",
     "f": "",
     "x": ""
    }
   ]
  },
  {
   "key": "slow_onset",
   "name": "Slow-onset losses",
   "one": "slow-onset record",
   "id": "slow_onset_id",
   "pref": "SO-{Y}-",
   "pad": 3,
   "prio": "1",
   "feeds": "Slow-onset trend analysis (m030) and DAPP signposts; slow-onset rows of the screening matrix",
   "when": "Each monitored indicator (beach width, well salinity), updated at each survey.",
   "fields": [
    {
     "k": "slow_onset_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "SO-YYYY-NNN. One row per indicator, place and period."
    },
    {
     "k": "is_example",
     "t": "list",
     "l": "yes_no",
     "r": true,
     "p": "1",
     "h": "Y for training examples."
    },
    {
     "k": "hazard",
     "t": "list",
     "l": "slow_hazard",
     "r": true,
     "p": "1",
     "h": "Slow-onset hazard."
    },
    {
     "k": "indicator",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "What is measured, e.g. dry beach width at a profile, well conductivity, land area lost."
    },
    {
     "k": "unit",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Unit of the indicator, e.g. m, m2, µS/cm, %."
    },
    {
     "k": "place",
     "t": "text",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Profile, well, segment or village."
    },
    {
     "k": "seg_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Coastal segment ID, if coastal."
    },
    {
     "k": "baseline_value",
     "t": "number",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Earliest reliable value."
    },
    {
     "k": "baseline_date",
     "t": "date",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Date of the baseline value."
    },
    {
     "k": "current_value",
     "t": "number",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Latest value."
    },
    {
     "k": "current_date",
     "t": "date",
     "l": null,
     "r": true,
     "p": "1",
     "h": "Date of the latest value."
    },
    {
     "k": "change",
     "t": "auto",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Calculated: current minus baseline. Do not type here."
    },
    {
     "k": "loss_description",
     "t": "long",
     "l": null,
     "r": false,
     "p": "1",
     "h": "What has been lost because of the change, e.g. boat haul-out no longer possible, well abandoned for irrigation."
    },
    {
     "k": "assets_people_affected",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "Assets, households or groups affected (no names)."
    },
    {
     "k": "evidence",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "How it was measured: levelled beach profile (IMA method), RTK, CoastSat, conductivity meter, interviews."
    },
    {
     "k": "signpost",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": "DAPP signpost this indicator feeds, and its agreed threshold if set (question I2)."
    },
    {
     "k": "confidence",
     "t": "list",
     "l": "confidence",
     "r": false,
     "p": "1",
     "h": ""
    },
    {
     "k": "source_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "1",
     "h": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "1",
     "h": ""
    }
   ]
  },
  {
   "key": "human_effects",
   "name": "Human effects",
   "one": "human effects row",
   "id": null,
   "pref": "HU-",
   "prio": "2",
   "feeds": "Social vulnerability (who is hit hardest); Sendai disaggregation",
   "when": "Significant events where a breakdown is known.",
   "fields": [
    {
     "k": "event_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "2",
     "h": "Effect record ID from the Events sheet."
    },
    {
     "k": "variable",
     "t": "list",
     "l": "effect_variable",
     "r": true,
     "p": "2",
     "h": "Which human effect."
    },
    {
     "k": "sex",
     "t": "list",
     "l": "sex",
     "r": true,
     "p": "2",
     "h": "Use Unknown when not reported."
    },
    {
     "k": "age_group",
     "t": "list",
     "l": "age_group",
     "r": true,
     "p": "2",
     "h": "Use Unknown when not reported."
    },
    {
     "k": "disability",
     "t": "list",
     "l": "disability",
     "r": true,
     "p": "2",
     "h": "Use Unknown when not reported."
    },
    {
     "k": "count",
     "t": "number",
     "l": null,
     "r": true,
     "p": "2",
     "h": "Number of people (or households for livelihoods)."
    },
    {
     "k": "as_of_date",
     "t": "date",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Date the count applies to. Needed for displacement, which changes over time."
    },
    {
     "k": "end_date",
     "t": "date",
     "l": null,
     "r": false,
     "p": "2",
     "h": "For evacuation or displacement: date people returned, if known."
    },
    {
     "k": "source_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    }
   ],
   "detail": true
  },
  {
   "key": "damage_losses",
   "name": "Damage and losses",
   "one": "damage row",
   "id": null,
   "pref": "DL-",
   "prio": "2",
   "feeds": "Sector consequence scores; loss and damage database (d034)",
   "when": "Significant events; physical quantities even without costs.",
   "fields": [
    {
     "k": "event_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "2",
     "h": "Effect record ID from the Events sheet."
    },
    {
     "k": "sector",
     "t": "list",
     "l": "sector",
     "r": true,
     "p": "2",
     "h": "PDNA / DELTA sector grouping."
    },
    {
     "k": "asset_type",
     "t": "text",
     "l": null,
     "r": true,
     "p": "2",
     "h": "What was affected, e.g. road, house, school, fishing boat, mangrove, beach."
    },
    {
     "k": "asset_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Site & Asset Register or facility ID, if known."
    },
    {
     "k": "unit",
     "t": "list",
     "l": "unit",
     "r": true,
     "p": "2",
     "h": "Physical unit for the quantity."
    },
    {
     "k": "quantity",
     "t": "number",
     "l": null,
     "r": true,
     "p": "2",
     "h": "Physical amount affected. Record this even when no cost is known."
    },
    {
     "k": "damage_state",
     "t": "list",
     "l": "damage_state",
     "r": true,
     "p": "2",
     "h": ""
    },
    {
     "k": "disruption_days",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Days the service or asset was out of use."
    },
    {
     "k": "value_type",
     "t": "list",
     "l": "value_type",
     "r": false,
     "p": "2",
     "h": "Damage, loss or additional cost, kept separate."
    },
    {
     "k": "value_local",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Value in the currency below."
    },
    {
     "k": "currency",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "ISO code, e.g. TTD."
    },
    {
     "k": "price_year",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Year the value is priced in, so it can be adjusted for inflation later."
    },
    {
     "k": "valuation",
     "t": "list",
     "l": "valuation",
     "r": false,
     "p": "2",
     "h": "How the value was obtained."
    },
    {
     "k": "source_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    },
    {
     "k": "recovery_status",
     "t": "list",
     "l": "recovery_status",
     "r": false,
     "p": "2",
     "h": "Has the asset or service recovered? Update at later visits."
    },
    {
     "k": "recovery_date",
     "t": "date",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Date it recovered or was replaced."
    }
   ],
   "detail": true
  },
  {
   "key": "ecosystem_losses",
   "name": "Ecosystem losses",
   "one": "ecosystem row",
   "id": null,
   "pref": "EC-",
   "prio": "2",
   "feeds": "Ecological adaptive capacity (d073); habitat condition ranks for InVEST and the ICVI",
   "when": "Events that visibly damage reefs, seagrass, mangroves or beaches.",
   "fields": [
    {
     "k": "record_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "2",
     "h": "Events event_id or Slow_Onset_Losses slow_onset_id this loss belongs to."
    },
    {
     "k": "ecosystem",
     "t": "list",
     "l": "ecosystem",
     "r": true,
     "p": "2",
     "h": ""
    },
    {
     "k": "place",
     "t": "text",
     "l": null,
     "r": true,
     "p": "2",
     "h": "Reef, bay, swamp or beach name."
    },
    {
     "k": "extent_before_ha",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Area before the event (reference)."
    },
    {
     "k": "extent_after_ha",
     "t": "number",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Area after the event."
    },
    {
     "k": "condition_before",
     "t": "list",
     "l": "condition",
     "r": true,
     "p": "2",
     "h": "Condition at the reference date."
    },
    {
     "k": "condition_after",
     "t": "list",
     "l": "condition",
     "r": true,
     "p": "2",
     "h": "Condition after the event."
    },
    {
     "k": "condition_indicator",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "What condition is judged on, e.g. live coral cover %, mangrove canopy, beach usable for turtle nesting."
    },
    {
     "k": "reference_source",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Where the before-state comes from: register ID, survey, imagery date."
    },
    {
     "k": "services_affected",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": "Ecosystem services reduced: coastal protection, fisheries nursery, tourism, nesting."
    },
    {
     "k": "assessment_date",
     "t": "date",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    },
    {
     "k": "source_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "2",
     "h": ""
    }
   ],
   "detail": true
  },
  {
   "key": "non_economic",
   "name": "Non-economic losses",
   "one": "non-economic row",
   "id": null,
   "pref": "NE-",
   "prio": "3",
   "feeds": "Values-at-risk layer (d068); vulnerability storylines",
   "when": "Significant events, mainly through parish sessions.",
   "fields": [
    {
     "k": "record_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "3",
     "h": "Events event_id or Slow_Onset_Losses slow_onset_id."
    },
    {
     "k": "nel_category",
     "t": "list",
     "l": "nel_category",
     "r": true,
     "p": "3",
     "h": "UNFCCC category of non-economic loss."
    },
    {
     "k": "description",
     "t": "long",
     "l": null,
     "r": true,
     "p": "3",
     "h": "What was lost, in the words of those affected where possible."
    },
    {
     "k": "community",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": ""
    },
    {
     "k": "groups_affected",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": "Groups, never names: e.g. older residents, fishers, children at the school."
    },
    {
     "k": "severity",
     "t": "list",
     "l": "severity",
     "r": false,
     "p": "3",
     "h": "As judged with the community."
    },
    {
     "k": "permanence",
     "t": "list",
     "l": "permanence",
     "r": false,
     "p": "3",
     "h": ""
    },
    {
     "k": "evidence_type",
     "t": "list",
     "l": "evidence_type",
     "r": true,
     "p": "3",
     "h": ""
    },
    {
     "k": "consent_recorded",
     "t": "list",
     "l": "yes_no",
     "r": true,
     "p": "3",
     "h": "Did people agree to this being recorded? (question I11)"
    },
    {
     "k": "source_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "3",
     "h": ""
    }
   ],
   "detail": true
  },
  {
   "key": "funding",
   "name": "Response funding",
   "one": "funding row",
   "id": null,
   "pref": "RF-",
   "prio": "3",
   "feeds": "Coping capacity (financial, d067); loss and damage finance gap",
   "when": "Significant events, when figures are available.",
   "fields": [
    {
     "k": "record_id",
     "t": "text",
     "l": null,
     "r": true,
     "p": "3",
     "h": "Events event_id (or hazardous_event_id for island-wide support)."
    },
    {
     "k": "funder_type",
     "t": "list",
     "l": "funder_type",
     "r": true,
     "p": "3",
     "h": ""
    },
    {
     "k": "funder_name",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": "Division, agency, insurer or organisation."
    },
    {
     "k": "purpose",
     "t": "list",
     "l": "funding_purpose",
     "r": true,
     "p": "3",
     "h": ""
    },
    {
     "k": "amount",
     "t": "number",
     "l": null,
     "r": false,
     "p": "3",
     "h": "Amount spent or paid. Leave blank if unknown; do not guess."
    },
    {
     "k": "currency",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": "ISO code, e.g. TTD."
    },
    {
     "k": "price_year",
     "t": "number",
     "l": null,
     "r": false,
     "p": "3",
     "h": ""
    },
    {
     "k": "date",
     "t": "date",
     "l": null,
     "r": false,
     "p": "3",
     "h": "Date paid or spent."
    },
    {
     "k": "source_id",
     "t": "text",
     "l": null,
     "r": false,
     "p": "3",
     "h": ""
    },
    {
     "k": "notes",
     "t": "long",
     "l": null,
     "r": false,
     "p": "3",
     "h": ""
    }
   ],
   "detail": true
  }
 ]
};
