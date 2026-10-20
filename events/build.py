from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter as L
import datetime as dt, os

# Tobago Event Inventory workbook and GeoPackage (Draft 0.6).
# Revised 19 October 2026 to match the live inventory (Apps Script version, Schema.gs of 13-14 October):
# Sources authority / repeat / geodata fields, the WhatsApp source type, coords_from and significant on Events,
# commons_photos_link on Field_Checks, the hazardous-event hazard list and the Met_Service_IDs sheet.
# Outputs are written next to this script unless OUT is set in the environment.
OUT=os.environ.get("OUT") or os.path.dirname(os.path.abspath(__file__))
XLSX=os.path.join(OUT,"Tobago_Event_Inventory_DRAFT.xlsx"); GPKG=os.path.join(OUT,"Tobago_Event_Inventory_DRAFT.gpkg")

FN="Arial"
def f(b=False,c="000000",s=10,i=False): return Font(name=FN,bold=b,color=c,size=s,italic=i)
TEAL="1F4E5A"; HEAD=PatternFill("solid",fgColor=TEAL); REQ=PatternFill("solid",fgColor="2F6B5E")
INP=PatternFill("solid",fgColor="FFF8D6"); EXF=PatternFill("solid",fgColor="EEF2F1")
thin=Side(style="thin",color="B9C6C4"); BOX=Border(left=thin,right=thin,top=thin,bottom=thin)
WR=Alignment(wrap_text=True,vertical="top")

LOOK={
"event_type":["Landslide","Rockfall","Debris flow","Flash flood","River flood","Urban / surface-water flood","Coastal overtopping / flooding","Coastal erosion episode","Road closure","Wildfire / bush fire","Sargassum influx","Drought impact","Extreme heat impact","Saltwater intrusion report","Wind damage","Storm surge flooding","Coral bleaching / marine heatwave","Climate-sensitive disease outbreak","Oil spill","Earthquake impact","Tsunami","Other"],
"trigger":["Heavy rainfall","Tropical storm / hurricane","Severe local storm","Swell / high waves","High tide","Dry spell / drought","Earthquake","Human activity (cutting, drainage, burning)","Unknown"],
"date_precision":["Exact day","Within a week","Month","Year","Approximate"],
"parish":["St. Andrew","St. David","St. George","St. John","St. Mary","St. Patrick","St. Paul"],
"location_precision":["GPS / RTK (< 10 m)","Road chainage (< 100 m)","Village or landmark (< 1 km)","Parish only"],
"yes_no":["Y","N","Unknown"],
"verification_status":["Reported","Desk-verified","Partner-observed","Field-verified","Duplicate","Rejected"],
"data_origin":["Unit field observation","Partner field monitoring","Official record (desk)","Media or social media","Community report","Remote sensing (satellite or drone, no site visit)"],
"check_type":["Verification visit (checks an existing record)","First-hand observation (team saw the event)","Follow-up visit (condition or recovery)"],
"check_outcome":["Confirmed","Confirmed with corrections","Not found / cannot confirm","Different event type","Duplicate of another record"],
"measure_method":["Visual estimate","Tape or measuring staff","GPS walk-over","Drone (UAS) survey","Other"],
"stoplight":["Green","Yellow","Red"],
"condition_now":["Still present","Partly cleared or repaired","Cleared or repaired","Worse than reported","Unknown"],
"confidence":["High","Medium","Low"],
"source_type":["TEMA report","Division of Infrastructure log","WASA record","Met Service record","News article","Social media post","Community interview","WhatsApp or messaging app","Unit field visit (form THA-FV-01)","Partner field monitoring","UAS / drone survey","Satellite image","Video","Photo or image","Online report or dataset","Other"],
"reliability":["Official record","Media","Community","Partner field data","Unit observation"],
"sector":["Social: Housing","Social: Education","Social: Health","Social: Culture and heritage","Productive: Agriculture, livestock and fisheries","Productive: Tourism","Productive: Commerce and industry","Infrastructure: Transport","Infrastructure: Water and sanitation","Infrastructure: Electricity","Infrastructure: Telecommunications","Cross-cutting: Environment and ecosystems","Cross-cutting: Governance and public services"],
"unit":["count","m","m2","m3","ha","km","households","days"],
"damage_state":["Partially damaged","Destroyed","Disrupted (no physical damage)"],
"value_type":["Damage (repair or replacement)","Loss (income forgone)","Additional cost (clean-up, response, temporary measures)"],
"valuation":["Reported cost","Quantity × unit cost","Expert estimate"],
"effect_variable":["Deaths","Missing","Injured or ill","Directly affected","Evacuated","Relocated","Livelihood disrupted (households)"],
"sex":["Female","Male","Unknown"],
"age_group":["0–14","15–64","65+","Unknown"],
"disability":["Yes","No","Unknown"],
"climate_flag":["Climate-related","Not climate-related","Unclear"],
"nel_category":["Life","Health","Human mobility","Territory (land lost)","Cultural heritage","Local and traditional knowledge","Societal and cultural identity","Biodiversity","Ecosystem services"],
"severity":["Low","Medium","High"],
"permanence":["Temporary","Long-lasting","Permanent"],
"evidence_type":["Community session","Interview","Field observation","Document","Survey"],
"ecosystem":["Coral reef","Seagrass","Mangrove / wetland","Beach / dune","Rocky shore","Forest","River / riparian","Other"],
"condition":["Good","Fair","Poor","Unknown"],
"slow_hazard":["Sea-level rise","Coastal erosion","Saltwater intrusion","Drought / drying","Rising temperature","Ocean acidification","Marine heatwave / bleaching","Sargassum (parallel stream)"],
"funder_type":["THA","Central Government","Parametric insurance (CCRIF)","Private insurance","Households / businesses","NGO / CBO / church","International donor or fund","Other"],
"funding_purpose":["Emergency response","Recovery","Reconstruction","Relief or compensation payments","Adaptation after the event"],
"recovery_status":["Not started","In progress","Recovered","Replaced elsewhere","Abandoned","Unknown"],
"he_hazard":["Heavy rainfall","Tropical storm / hurricane","Severe local storm","Swell / high waves","Storm surge","High tide / king tide","Dry spell / drought","Extreme heat","Marine heatwave","Sargassum influx wave","Earthquake","Tsunami","Other"],
"met_match":["Matched to a hazardous event","No impacts recorded in Tobago","Not yet checked"],
"authority":["Mandated agency, within its mandate","Other official","Not official"],
"geodata_type":["Points","Lines or areas","Map image or PDF","Whole dataset"],
"gis_status":["Not yet with the GIS Specialist","With the GIS Specialist","Checked and loaded to the GeoPackage","Not usable (explain in notes)"],
}
AUTH_M="Mandated agency, within its mandate"
TRIGGER_CLIMATE=[("Heavy rainfall","Climate-related"),("Tropical storm / hurricane","Climate-related"),("Severe local storm","Climate-related"),("Swell / high waves","Climate-related"),("High tide","Climate-related"),("Dry spell / drought","Climate-related"),("Earthquake","Not climate-related"),("Human activity (cutting, drainage, burning)","Not climate-related"),("Unknown","Unclear")]
# field, type, required, lookup, description, example, feeds
FIELDS=[
("event_id","Text","Y",None,"Unique ID: EV-YYYY-NNNN. YYYY is the year the event happened (year of date_start) when the ID is issued; NNNN is the next running number in that year. Never change an ID once issued, even if the date is later corrected: other sheets link to it. Examples use EX-.","EV-2027-0001","All"),
("record_uuid","Text","N",None,"Universally unique ID, filled automatically when the record is loaded to the GeoPackage or created in QField (uuid()). Never edit. Used to link records across systems such as DELTA Resilience.","(auto)","Interoperability"),
("is_example","Y/N","Y","yes_no","Y for training examples. Delete example rows before real use.","N","QA"),
("event_type","List","Y","event_type","What happened. One row per type per location.","Landslide","Hazard layer; impact chain"),
("sargassum_flag","List","N*","stoplight","Sargassum events only: the coastal unit's stoplight class (TTSMP) for this stranding: Green, Yellow or Red. *Required when event_type is Sargassum influx. Record only Yellow and Red strandings, and Green ones with a reported impact (facility or landing site blocked, health complaints, nesting affected, business losses, clean-up spending).","Red","Sargassum stream"),
("stranding_ref","Text","N",None,"Sargassum events only: observation ID(s) from the Coastal Zone Management Unit's Sargassum Stranding Record (e.g. BCH-03-20261015), separated by semicolons.","BCH-03-20261015",""),
("event_subtype","Text","N",None,"More detail, e.g. debris slide, slump, culvert overflow.","Debris slide",""),
("parent_event_id","Text","N",None,"ID of the event that caused this one. Records cascades, e.g. landslide → road closure.","EV-2027-0001","Cascade analysis (shared nodes)"),
("hazardous_event_id","Text","N*",None,"ID from the Hazardous_Events sheet for the storm, rain event, swell or dry spell that caused this record. One hazardous event links to many effect records, as in DELTA Resilience. *Required when the trigger is Heavy rainfall, Tropical storm / hurricane or Swell / high waves (create the Hazardous_Events row first).","HE-2027-001","Sendai / DELTA reporting"),
("glide_no","Text","N",None,"GLIDE number for large or named events, if one was issued.","TC-2027-000123-TTO","Cross-reference to global databases"),
("trigger","List","Y","trigger","Main cause.","Heavy rainfall","Rainfall thresholds"),
("trigger_event_name","Text","N",None,"Named storm or weather system, if any.","Tropical Storm X",""),
("climate_related","Formula","Auto",None,"Filled automatically from the trigger: Climate-related, Not climate-related or Unclear (see Lookups). Do not type here.","Climate-related",""),
("significant","Formula","Auto",None,"Filled automatically. Interim rule until open question I4 is settled (manual, Option A impact criteria): Yes if any death, any building destroyed, a road closed for more than 24 hours, or any THA spending on the event on the Response_Funding sheet. Do not type here.","No","Decides which events get loss and damage detail"),
("attribution_ref","Text","N",None,"Reference to a published attribution study for this event (for example World Weather Attribution), if one exists. Leave blank otherwise; never infer attribution.","",""),
("date_start","Date","Y",None,"Date the event began (YYYY-MM-DD). If only month known, use the 1st and set date_precision.","2027-11-12","Frequency, seasonality"),
("date_end","Date","N",None,"Date it ended, for floods, closures, Sargassum.","2027-11-13","Duration"),
("date_precision","List","Y","date_precision","How exact the date is.","Exact day","Confidence"),
("parish","List","Y","parish","Parish where it happened.","St. Paul","Reporting"),
("community","Text","N",None,"Nearest village or community.","Roxborough",""),
("location_desc","Text","Y",None,"Plain description someone could find on the ground.","Windward Road, 300 m east of junction",""),
("easting","Number","N*",None,"UTM Zone 20N easting (EPSG:32620), metres. *Required unless precision is Parish only.","763700","Maps"),
("northing","Number","N*",None,"UTM Zone 20N northing (EPSG:32620), metres.","1244900","Maps"),
("location_precision","List","Y","location_precision","How exact the location is. Low-precision points are not used to train susceptibility models.","GPS / RTK (< 10 m)","Model training filter"),
("coords_from","Text","N",None,"Where the easting and northing came from: Unit GPS, a field check ID (FC-…), or the source ID (SRC-…) of an agency's geodata. Coordinates from agency geodata go on an event only after the GIS Specialist has processed that source (its gis_status reads Checked and loaded to the GeoPackage); they also set location_precision.","FC-2027-001","Traceability of locations"),
("road_name","Text","N",None,"Road affected, if any.","Windward Road","Road closure log (d056)"),
("road_chainage_km","Number","N",None,"Distance along the road from its start point, if known.","24.3",""),
("site_id","Text","N",None,"Coastal Site ID from the Site & Asset Register (Form A/B).","S014","Links to Tier 2"),
("asset_id","Text","N",None,"Asset ID if a specific structure was affected.","S014-A01","Links to Tier 2"),
("length_m","Number","N",None,"Length of slide scar, flood reach or eroded shoreline.","35",""),
("width_m","Number","N",None,"Width of slide or flooded area.","12",""),
("area_m2","Number","N",None,"Area affected (fires, floods, Sargassum).","420",""),
("volume_m3","Number","N",None,"Estimated volume of slide material or Sargassum.","150",""),
("water_depth_m","Number","N",None,"Maximum observed flood depth.","0.4","Flood validation"),
("road_closed","Y/N","N","yes_no","Was a road fully or partly closed?","Y","IC1 isolation"),
("closure_hours","Number","N",None,"Hours until the road reopened.","18","IC1 capacity (C1)"),
("people_affected","Number","N",None,"People affected (estimate; say how in notes).","1200","Exposure validation"),
("people_displaced","Number","N",None,"People who left their homes.","0",""),
("people_relocated","Number","N",None,"People moved permanently or long term (DesInventar 'relocated').","0","Sendai B-1"),
("livelihoods_disrupted","Number","N",None,"Households whose income was disrupted or lost (fishers, vendors, farmers, guest houses).","3","Sendai B-5"),
("injuries","Number","N",None,"Number injured.","0","Loss & damage (d034)"),
("deaths","Number","N",None,"Number of deaths.","0","Loss & damage (d034)"),
("missing","Number","N",None,"Number of people missing.","0","Sendai A-3"),
("disaggregation","Text","N",None,"Deaths, injuries and people affected by sex, age group (under 15, 15–64, 65+) and disability, where known. Example: deaths F1 M0; injured 65+: 2.","","Sendai disaggregation"),
("buildings_damaged","Number","N",None,"Buildings damaged.","2",""),
("buildings_destroyed","Number","N",None,"Buildings destroyed.","0",""),
("dwellings_damaged","Number","N",None,"Of the buildings damaged, how many are homes.","1","Sendai B-3, C-4"),
("dwellings_destroyed","Number","N",None,"Of the buildings destroyed, how many are homes.","0","Sendai B-4, C-4"),
("education_facilities_damaged","Number","N",None,"Schools and other education buildings damaged or destroyed.","0","Sendai D-3"),
("health_facilities_damaged","Number","N",None,"Health centres, hospitals and clinics damaged or destroyed.","0","Sendai D-2"),
("roads_damaged_m","Number","N",None,"Length of road damaged or destroyed, metres.","35","Sendai D-4, C-5"),
("crops_ha","Number","N",None,"Area of crops damaged or lost, hectares.","0","Sendai C-2"),
("livestock_lost","Number","N",None,"Livestock lost (count; say which animals in notes).","0","Sendai C-2"),
("boats_damaged","Number","N",None,"Fishing boats damaged or destroyed.","0","Sendai C-2 (fisheries)"),
("heritage_damaged","Text","N",None,"Cultural heritage or sites of community value damaged (buildings, burial grounds, monuments).","","Sendai C-6; values at risk (d068)"),
("facilities_affected","Text","N",None,"Critical facilities affected (school, health centre, shelter, intake).","None",""),
("utilities_affected","Text","N",None,"Water, power, telecoms cut, and for how long.","Power, 6 h",""),
("damage_desc","Text","N",None,"Short description of damage. If there is no countable impact, say so here, e.g. 'No impact beyond the hazard: open grassland burned'; this counts as the record's impact field.","Lane blocked, culvert buried",""),
("est_cost_ttd","Number","N",None,"Estimated cost of direct physical damage (repair or replacement), TT$.","85000","Loss & damage (d034)"),
("est_loss_ttd","Number","N",None,"Estimated losses, TT$: lost income, extra costs and clean-up, kept separate from damage (DesInventar and PDNA/DaLA practice).","12000","Loss & damage (d034)"),
("price_year","Number","N",None,"Year the TT$ values in est_cost_ttd and est_loss_ttd are priced in, so they can be adjusted for inflation.","2025",""),
("cost_source","Text","N",None,"Where the cost figure came from.","Division of Infrastructure",""),
("data_origin","List","Y","data_origin","How the information first reached the unit: who saw or measured it. This is not verification. Field data collected by a partner (for example the coastal unit's beach photos) is 'Partner field monitoring'.","Partner field monitoring","Confidence"),
("origin_agency","Text","N",None,"Who collected or first reported it, e.g. the coastal unit (weekly beach photos), Division of Infrastructure, TEMA. Needed when data_origin is Partner field monitoring.","Coastal unit, weekly beach photo log",""),
("verification_status","List","Y","verification_status","Reported (not yet confirmed) → Desk-verified (one record from the mandated agency, about a claim within its mandate; or two independent sources; a source that repeats another never counts as the second) → Partner-observed (a partner's own field data; the CRVA team has not visited) → Field-verified (set only by a confirming field check by the CRVA team, on the Field_Checks sheet). The desk_rule column at the far right shows whether the linked sources meet the Desk-verified rule.","Field-verified","QA"),
("verified_by","Text","N",None,"CRVA team member(s) who verified. For a field check, copy the team from the Field_Checks row.","Research Associate 1",""),
("verification_date","Date","N",None,"Date verified.","2027-11-20",""),
("field_check_id","Text","N",None,"Visit ID (FC-YYYY-NNN) from the Field_Checks sheet that confirmed this record. Required when verification_status is Field-verified.","FC-2027-001","QA"),
("photo_ids","Text","N",None,"Photo file names, separated by semicolons. For field-verified records, the field check holds the visit photos.","EV0001_01.jpg; EV0001_02.jpg",""),
("confidence","List","Y","confidence","Overall confidence in the record.","High","Weighting"),
("duplicate_of","Text","N",None,"If status is Duplicate, the ID of the record it duplicates.","",""),
("register_ids","Text","N",None,"Data register entries this record feeds.","d031; d056",""),
("notes","Text","N",None,"Anything else, including how estimates were made.","",""),
("recorded_by","Text","Y",None,"Who entered the record.","Research Associate 1","QA"),
("recorded_date","Date","Y",None,"Date entered.","2027-11-14","QA"),
]
E1="1 Essential (Tier 1)"; E2="2 Recommended"; E3="3 Loss & damage extension"
PRIO={
"event_id":(E1,"Every CRVA use: links the record to maps, impact chains and the loss and damage database"),
"record_uuid":(E2,"Exchange with ODPM and DELTA Resilience (automatic)"),
"is_example":(E1,"QA: keeps training rows out of every CRVA count"),
"event_type":(E1,"Screening matrix likelihood (how often each hazard happens); hazard map validation; impact chains"),
"sargassum_flag":(E1,"Sargassum stream: entry rule (Yellow, Red, or Green with impact); magnitude M of the sargassum hazard score"),
"stranding_ref":(E2,"Links the event to the coastal unit's full stranding record (frequency and persistence come from there, not from event counts)"),
"event_subtype":(E2,"Landslide and flood susceptibility (type of slide or flood)"),
"parent_event_id":(E1,"Impact chains: measures cascades and shared nodes (e.g. landslide → road closure, IC1)"),
"hazardous_event_id":(E1,"Links impacts to rainfall, swell or storm data for thresholds and signposts; storm-level frequency; Sendai and DELTA reporting. Essential when the trigger is rainfall, storm or swell"),
"glide_no":(E3,"Cross-reference to global databases for large events"),
"trigger":(E1,"Rainfall and swell thresholds; hazard drivers in the screening matrix; sets climate_related"),
"trigger_event_name":(E2,"Links events to named storms in the hurricane hazard work"),
"climate_related":(E1,"Separates climate from non-climate hazards in the screening matrix and in loss and damage totals (automatic)"),
"significant":(E1,"Decides which events get Loss & damage detail (Human_Effects, Damage_Losses, Ecosystem, Non-economic, Response_Funding); unit lead review (automatic)"),
"coords_from":(E1,"Traceability of every location used for map validation and training"),
"attribution_ref":(E3,"Loss and damage reporting only; not used in Tier 1"),
"date_start":(E1,"Event frequency and seasonality for screening likelihood; trends for DAPP signposts"),
"date_end":(E2,"Duration of floods, closures and sargassum events"),
"date_precision":(E1,"Decides which records are used for frequency and trend analysis"),
"parish":(E1,"Exposure and vulnerability summaries by parish; reporting"),
"community":(E2,"Community-level validation in parish sessions; vulnerability storylines"),
"location_desc":(E1,"Lets the team find and field-verify the site"),
"easting":(E1,"Hazard map validation; landslide and flood susceptibility training points"),
"northing":(E1,"Hazard map validation; landslide and flood susceptibility training points"),
"location_precision":(E1,"Filter: only GPS and road-chainage records train susceptibility models"),
"road_name":(E1,"Isolation impact chain (IC1); road closure log (d056)"),
"road_chainage_km":(E2,"Places road events precisely for IC1 and landslide mapping"),
"site_id":(E2,"Links coastal events to the Site and Asset Register; Tier 2 hotspot selection"),
"asset_id":(E2,"Links damage to a specific defence or asset (Form A)"),
"length_m":(E2,"Hazard magnitude for landslide and erosion mapping"),
"width_m":(E2,"Hazard magnitude for landslide mapping"),
"area_m2":(E2,"Hazard magnitude for floods, fires and sargassum"),
"volume_m3":(E2,"Hazard magnitude for slides and sargassum"),
"water_depth_m":(E2,"Flood and overtopping map validation"),
"road_closed":(E1,"Isolation impact chain (IC1): how often communities are cut off"),
"closure_hours":(E1,"Isolation impact chain (IC1): how long; DAPP signpost for road access"),
"people_affected":(E1,"Screening matrix consequence score; impact chain validation"),
"people_displaced":(E2,"Consequence and coping capacity (shelter use)"),
"people_relocated":(E2,"Long-term consequence; Sendai B-1"),
"livelihoods_disrupted":(E2,"Livelihood impact chain (IC3, fishing and tourism households)"),
"injuries":(E2,"Consequence (health); Sendai B-2"),
"deaths":(E1,"Screening matrix consequence score (high-consequence flag)"),
"missing":(E2,"Consequence; Sendai A-3"),
"disaggregation":(E2,"Social vulnerability: which groups are hit hardest"),
"buildings_damaged":(E1,"Screening matrix consequence; exposure validation"),
"buildings_destroyed":(E1,"Screening matrix consequence; exposure validation"),
"dwellings_damaged":(E2,"Housing exposure validation; Sendai B-3"),
"dwellings_destroyed":(E2,"Housing exposure validation; Sendai B-4"),
"education_facilities_damaged":(E2,"Critical facility exposure; Sendai D-3"),
"health_facilities_damaged":(E2,"Critical facility exposure; Sendai D-2"),
"roads_damaged_m":(E2,"Road exposure and IC1; Sendai D-4"),
"crops_ha":(E2,"Agriculture sector consequence"),
"livestock_lost":(E2,"Agriculture sector consequence"),
"boats_damaged":(E2,"Fisheries consequence (IC3)"),
"heritage_damaged":(E2,"Values-at-risk layer (d068)"),
"facilities_affected":(E1,"Critical facility exposure validation (d039)"),
"utilities_affected":(E2,"Service disruption; coping capacity"),
"damage_desc":(E2,"Context for consequence scoring"),
"est_cost_ttd":(E2,"Loss and damage database (d034); economic consequence"),
"est_loss_ttd":(E2,"Loss and damage database (d034); economic consequence"),
"price_year":(E2,"Makes costs from different years comparable"),
"cost_source":(E2,"Confidence in cost figures"),
"data_origin":(E1,"Confidence weighting; separates partner field data from the team's own field checks"),
"origin_agency":(E2,"Audit trail; who to ask for the partner's raw data (photos, measurements)"),
"verification_status":(E1,"Only Desk-verified, Partner-observed and Field-verified records are used in CRVA analysis"),
"field_check_id":(E2,"Audit trail: links a Field-verified record to its field check"),
"verified_by":(E2,"Audit trail"),
"verification_date":(E2,"Audit trail"),
"photo_ids":(E2,"Evidence for field verification and validation"),
"confidence":(E1,"Weights records in validation and trend analysis"),
"duplicate_of":(E1,"QA: stops double counting in frequency and consequence"),
"register_ids":(E2,"Links records to Risk Data Register datasets"),
"notes":(E2,"How estimates were made"),
"recorded_by":(E1,"Audit trail"),
"recorded_date":(E1,"Audit trail"),
}
assert set(PRIO)=={x[0] for x in FIELDS}, set(PRIO)^{x[0] for x in FIELDS}
D=dt.date
EX=[
 dict(event_id="EX-2025-0001",is_example="Y",data_origin="Official record (desk)",origin_agency="Division of Infrastructure road log",field_check_id="FC-EX-001",hazardous_event_id="HE-EX-001",event_type="Landslide",event_subtype="Debris slide",trigger="Heavy rainfall",date_start=D(2025,11,12),date_end=D(2025,11,12),date_precision="Exact day",parish="St. Paul",community="Roxborough",location_desc="EXAMPLE: Windward Road, cut slope east of village",easting=763700,northing=1244900,location_precision="GPS / RTK (< 10 m)",road_name="Windward Road",length_m=35,width_m=12,volume_m3=150,road_closed="Y",closure_hours=18,damage_desc="Both lanes blocked; drain buried",est_cost_ttd=85000,price_year=2025,cost_source="Example only",verification_status="Field-verified",verified_by="Research Associate 1",verification_date=D(2025,11,20),photo_ids="EX0001_01.jpg; EX0001_02.jpg",confidence="High",register_ids="d031",notes="Fictional training example.",recorded_by="Research Associate 1",recorded_date=D(2025,11,14)),
 dict(event_id="EX-2025-0002",is_example="Y",data_origin="Official record (desk)",origin_agency="Division of Infrastructure road log",hazardous_event_id="HE-EX-001",event_type="Road closure",parent_event_id="EX-2025-0001",trigger="Heavy rainfall",date_start=D(2025,11,12),date_end=D(2025,11,13),date_precision="Exact day",parish="St. Paul",community="Roxborough",location_desc="EXAMPLE: Windward Road closed at slide site",easting=763700,northing=1244900,location_precision="GPS / RTK (< 10 m)",road_name="Windward Road",road_closed="Y",closure_hours=18,people_affected=1200,facilities_affected="Route to health centre",verification_status="Desk-verified",confidence="Medium",register_ids="d056",notes="Fictional. Caused by EX-2025-0001; people affected estimated from districts beyond the closure.",recorded_by="Research Associate 1",recorded_date=D(2025,11,14)),
 dict(event_id="EX-2025-0003",is_example="Y",data_origin="Official record (desk)",origin_agency="TEMA situation report",hazardous_event_id="HE-EX-002",event_type="Urban / surface-water flood",event_subtype="Drain overflow",trigger="Heavy rainfall",date_start=D(2025,10,28),date_end=D(2025,10,28),date_precision="Exact day",parish="St. Andrew",community="Scarborough",location_desc="EXAMPLE: low-lying street near the waterfront",easting=747300,northing=1237050,location_precision="Village or landmark (< 1 km)",coords_from="EX-SRC-003",water_depth_m=0.4,buildings_damaged=6,people_affected=40,people_displaced=2,damage_desc="Ground floors flooded; shop stock lost",verification_status="Desk-verified",confidence="Medium",register_ids="d032",notes="Fictional training example.",recorded_by="Research Associate 2",recorded_date=D(2025,11,3)),
 dict(event_id="EX-2026-0004",is_example="Y",data_origin="Community report",event_type="Coastal overtopping / flooding",trigger="Swell / high waves",date_start=D(2026,2,3),date_precision="Exact day",parish="St. John",community="Speyside",location_desc="EXAMPLE: seawall fronting the main road",easting=768760,northing=1250060,location_precision="GPS / RTK (< 10 m)",site_id="S0XX",asset_id="S0XX-A01",water_depth_m=0.2,road_closed="N",damage_desc="Debris on road; minor scour behind wall",verification_status="Reported",confidence="Low",register_ids="d032",notes="Fictional. Request a Form A visit to confirm and survey the wrack line.",recorded_by="Research Associate 1",recorded_date=D(2026,2,5)),
 dict(event_id="EX-2024-0005",is_example="Y",data_origin="Community report",event_type="Rockfall",trigger="Heavy rainfall",date_start=D(2024,7,1),date_precision="Month",parish="St. John",community="Charlotteville",location_desc="EXAMPLE: road above the village, steep cutting",easting=767650,northing=1252700,location_precision="Village or landmark (< 1 km)",volume_m3=5,road_closed="Y",closure_hours=4,verification_status="Desk-verified",confidence="Medium",register_ids="d031; d056",notes="Fictional. Date known only to the month.",recorded_by="Research Associate 1",recorded_date=D(2026,1,20)),
 dict(event_id="EX-2026-0006",is_example="Y",data_origin="Unit field observation",verified_by="Research Associate 2",verification_date=D(2026,4,16),photo_ids="EX0006_01.jpg; EX0006_02.jpg",field_check_id="FC-EX-002",event_type="Wildfire / bush fire",trigger="Dry spell / drought",date_start=D(2026,4,15),date_end=D(2026,4,16),date_precision="Exact day",parish="St. David",community="Plymouth",location_desc="EXAMPLE: grassy hillside above the village",easting=742600,northing=1241000,location_precision="GPS / RTK (< 10 m)",area_m2=20000,damage_desc="No impact beyond the hazard: open grassland burned, no structures or crops affected",verification_status="Field-verified",confidence="High",notes="Fictional training example.",recorded_by="Research Associate 2",recorded_date=D(2026,4,17)),
 dict(event_id="EX-2026-0007",is_example="Y",sargassum_flag="Red",stranding_ref="EX-BCH-01-20260603",data_origin="Partner field monitoring",origin_agency="Coastal unit, weekly beach photo log (example)",verified_by="Research Associate 1",verification_date=D(2026,6,15),photo_ids="EX0007_UAS_ortho.tif",field_check_id="FC-EX-003",event_type="Sargassum influx",trigger="Unknown",date_start=D(2026,6,1),date_end=D(2026,6,30),date_precision="Month",parish="St. John",community="Speyside",location_desc="EXAMPLE: beach and fish landing site",easting=768800,northing=1250100,location_precision="GPS / RTK (< 10 m)",volume_m3=300,facilities_affected="Fish landing site",verification_status="Field-verified",confidence="High",register_ids="d027",notes="Fictional. First seen in the coastal unit's weekly photos (Partner-observed); the CRVA team then flew a drone survey (FC-EX-003), so it is now Field-verified.",recorded_by="Research Associate 1",recorded_date=D(2026,7,2)),
 dict(event_id="EX-2026-0009",is_example="Y",sargassum_flag="Yellow",stranding_ref="EX-BCH-02-20260804",data_origin="Partner field monitoring",origin_agency="Coastal unit, weekly beach photo log (example)",event_type="Sargassum influx",trigger="Unknown",date_start=D(2026,8,4),date_precision="Exact day",parish="St. Patrick",community="Crown Point",location_desc="EXAMPLE: north end of the bay, near the beach facility",easting=738600,northing=1233900,location_precision="GPS / RTK (< 10 m)",damage_desc="No impact reported beyond the stranding itself",verification_status="Partner-observed",confidence="Medium",register_ids="d027",notes="Fictional. Dated, geotagged photos from the coastal unit's weekly monitoring. Not yet checked by the CRVA team; a field check (THA-FV-01) would make it Field-verified.",recorded_by="Research Associate 1",recorded_date=D(2026,8,6)),
 dict(event_id="EX-2025-0008",is_example="Y",data_origin="Media or social media",event_type="Urban / surface-water flood",trigger="Heavy rainfall",date_start=D(2025,10,28),date_precision="Exact day",parish="St. Andrew",community="Scarborough",location_desc="EXAMPLE: same flood reported in a news article",easting=747350,northing=1237000,location_precision="Village or landmark (< 1 km)",verification_status="Duplicate",confidence="Low",duplicate_of="EX-2025-0003",notes="Fictional. Kept so the source is not lost; excluded from analysis.",recorded_by="Research Associate 2",recorded_date=D(2025,11,3)),
]
# Sources: field, width, lookup, required, help (order and wording as in the live inventory)
SRC_DEF=[
("source_id",14,None,True,"SRC-NNNN. One row per document, log, article, message, interview or observation."),
("is_example",10,"yes_no",True,"Y for training examples."),
("source_type",26,"source_type",True,"WhatsApp or messaging app: a message or photo sent by a member of the public. Authority is Not official. Publisher is 'Member of the public via WhatsApp', never the sender's name or number. One source per sender per event; a forwarded message repeats its original and is never a new source. Photos go only to the restricted Climate Unit folder 'Community reports – restricted' (never the Commons); give their WA reference in agency_record_ids. Put a short note of what the message said in notes, without names or numbers."),
("title",40,None,True,"Title or short description of the document, log, article or interview."),
("publisher",26,None,False,"Who produced it: agency, newspaper, partner or 'Member of the public via WhatsApp'. Never a private person's name."),
("agency_record_ids",24,None,False,"The originating agency's own IDs for this record, so it can be traced back: field form number, observation ID, photo numbers, situation report number. Separate several with semicolons, e.g. BCH-02-20260804; IMG_0412–0418. Use reference_or_url for where to find the document."),
("source_date",12,None,True,"Date of the document, message or observation."),
("reference_or_url",30,None,False,"Where to find the document if it is not online: file, folder, page. Put the agency's own record numbers in agency_record_ids and web addresses in link_url."),
("link_url",36,None,False,"Web address of the article, video, social media post, photo or online report. Paste the full link, starting with https://. Use the archived copy if the original may disappear."),
("reliability",18,"reliability",False,""),
("authority",30,"authority",False,"Mandated agency, within its mandate: the record comes from the agency mandated for this kind of claim, and is about that claim. Met Service: rainfall, wind, warnings, storm tracks. TEMA / ODPM: disaster declarations, people affected, shelters, official damage assessments. Division of Infrastructure: road closures and road damage. WASA: water supply outages. IMA: marine heatwaves, coral bleaching, marine disease, sargassum science and offshore monitoring. Coastal Zone Management Unit: beach and coastal monitoring, sargassum stranding flags (TTSMP). One such record makes an event Desk-verified on its own. Other official: any other government record. Not official: media, social media, community, other."),
("repeats_source_id",16,None,False,"If this source repeats or is built from another source (a news story from a TEMA report, a post sharing a Met Service bulletin), give that source's ID, or the original's reference if it is not in the inventory. A repeat never counts as a second independent source. Reposts and shares of the same post are not new sources: add their links to the original's notes."),
("original_held",11,"yes_no",False,"Only with repeats_source_id. Y: the original is entered as a source; cite it on the event too. N: the original is not held, so this copy stands in for it as weaker evidence; ask the agency for the original."),
("has_geodata",11,"yes_no",False,"Does this source include geospatial data: coordinates, flood extents or other shapes, a map, or a GIS layer? If Y, send it to the GIS Specialist before using it anywhere else."),
("geodata_type",18,"geodata_type",False,"Points: a location per incident. Lines or areas: flood extents, affected areas, road sections. Map image or PDF: a picture, to be georeferenced. Whole dataset: a layer of many incidents, which also gets a Risk Data Register entry."),
("geodata_file",28,None,False,"File name(s) as received, e.g. TEMA_flood_extent_20271112.kml."),
("geodata_link",30,None,False,"Link to the file in the Commons, the team's register of all data held. For WhatsApp location pins, link to the restricted Drive folder instead: WhatsApp material never goes in the Commons. Until the file is stored, leave blank and say in notes where it is."),
("original_crs",24,None,False,"Coordinate system the file came in, e.g. WGS84 latitude/longitude (EPSG:4326). The GIS Specialist converts it to UTM 20N (EPSG:32620)."),
("gis_status",28,"gis_status",False,"Set by the GIS Specialist. Coordinates or shapes from this source are used on events only once it reads Checked and loaded to the GeoPackage."),
("sharing_terms",24,None,False,"Any limits the agency placed on use or sharing. Restricted data stays in the Commons and the GeoPackage, not on shared pages."),
("notes",30,None,False,""),
]
SRC_COLS=[x[0] for x in SRC_DEF]
SRC_X=[
 dict(source_id="EX-SRC-001",is_example="Y",source_type="Division of Infrastructure log",title="Road incident log, November (example)",publisher="Division of Infrastructure",source_date=D(2025,11,13),reference_or_url="File ref (example)",reliability="Official record",authority=AUTH_M,notes="Fictional"),
 dict(source_id="EX-SRC-002",is_example="Y",source_type="Unit field visit (form THA-FV-01)",title="Unit site visit (example)",publisher="Climate unit",source_date=D(2025,11,20),reference_or_url="Photos EX0001_01-02; visit FC-EX-001",reliability="Unit observation",authority="Other official",notes="Fictional"),
 dict(source_id="EX-SRC-003",is_example="Y",source_type="TEMA report",title="Situation report (example)",publisher="TEMA",source_date=D(2025,10,29),reference_or_url="File ref (example)",reliability="Official record",authority=AUTH_M,has_geodata="Y",geodata_type="Lines or areas",geodata_file="EX_TEMA_flood_extent_20251028.kml (example)",original_crs="WGS84 latitude/longitude (EPSG:4326)",gis_status="Checked and loaded to the GeoPackage",notes="Fictional"),
 dict(source_id="EX-SRC-004",is_example="Y",source_type="News article",title="Article on Scarborough flooding (example)",publisher="Newspaper (example)",source_date=D(2025,10,29),reference_or_url="URL (example)",reliability="Media",authority="Not official",repeats_source_id="EX-SRC-003",original_held="Y",notes="Fictional"),
 dict(source_id="EX-SRC-005",is_example="Y",source_type="Community interview",title="Parish mapping session (example)",publisher="Climate unit",source_date=D(2026,1,20),reference_or_url="Session notes (example)",reliability="Community",authority="Not official",notes="Fictional"),
 dict(source_id="EX-SRC-006",is_example="Y",source_type="UAS / drone survey",title="Sargassum UAS flight (example)",publisher="Climate unit",source_date=D(2026,6,15),reference_or_url="Flight ID (example); visit FC-EX-003",reliability="Unit observation",authority="Other official",notes="Fictional"),
 dict(source_id="EX-SRC-007",is_example="Y",source_type="Partner field monitoring",title="Weekly beach photo log, August (example)",publisher="Coastal unit",agency_record_ids="EX-BCH-02-20260804; IMG_0412–0418",source_date=D(2026,8,5),reference_or_url="Photo set 2026-W32 (example)",reliability="Partner field data",authority=AUTH_M,notes="Fictional"),
 dict(source_id="EX-SRC-008",is_example="Y",source_type="Partner field monitoring",title="Weekly beach photo log, June (example)",publisher="Coastal unit",agency_record_ids="EX-BCH-01-20260603; IMG_0101–0109",source_date=D(2026,6,3),reference_or_url="Photo set 2026-W23 (example)",reliability="Partner field data",authority=AUTH_M,notes="Fictional"),
 dict(source_id="EX-SRC-009",is_example="Y",source_type="WhatsApp or messaging app",title="Resident's photos of the road slip, Roxborough (example)",publisher="Member of the public via WhatsApp (received by Research Associate)",agency_record_ids="WA-20251112-01",source_date=D(2025,11,12),reference_or_url="Community reports – restricted (Climate Unit Google Drive folder)",reliability="Community",authority="Not official",notes="Fictional. Resident sent two photos of the slip blocking one lane, taken that morning. Sender confirmed they took them and agreed to their use."),
]
SRC=[[s.get(k) for k in SRC_COLS] for s in SRC_X]
LINK=[["EX-2025-0001","EX-SRC-001"],["EX-2025-0001","EX-SRC-002"],["EX-2025-0002","EX-SRC-001"],["EX-2025-0002","EX-SRC-009"],["EX-2025-0003","EX-SRC-003"],["EX-2025-0003","EX-SRC-004"],["EX-2026-0004","EX-SRC-005"],["EX-2024-0005","EX-SRC-005"],["EX-2026-0006","EX-SRC-002"],["EX-2026-0007","EX-SRC-006"],["EX-2025-0008","EX-SRC-004"],["EX-2026-0007","EX-SRC-008"],["EX-2026-0009","EX-SRC-007"]]

wb=Workbook()
# Read me
r=wb.active; r.title="Read me"; r.column_dimensions["A"].width=3; r.column_dimensions["B"].width=26; r.column_dimensions["C"].width=100
r["B1"]="Tobago Hazard Event Inventory — Record System"; r["B1"].font=f(True,TEAL,16)
r["B2"]="Draft 0.6 (DesInventar, Sendai and DELTA Resilience structure; loss and damage sheets; data origin and field checks; Tier 1 feed checks from the alternate review; revised 19 October 2026 to match the live inventory: source authority and repeats, WhatsApp reports, geodata, Met Service IDs) · Tier 1 field workstream A · Tobago House of Assembly, Division of Environment, Climate Resilience and Energy"; r["B2"].font=f(i=True,c="5B6C70")
rows=[
("Master copy","The live inventory is the Google Apps Script web app with its Google Sheet. This workbook is the offline and training copy, built from the same field list. If they differ, the live inventory is right."),
("Purpose","One shared record of past hazard events in Tobago: landslides, rockfalls, floods, coastal overtopping, road closures, wildfires, Sargassum influxes and others. It validates the Tier 1 hazard maps, trains landslide and flood susceptibility models, supplies DAPP signposts and starts the loss and damage database."),
("Structure","Events: one row per event at one location.\nSources: one row per document, log, interview or observation.\nField_Checks: one row per CRVA team site visit to check an event (form THA-FV-01).\nEvent_Sources: links each event to every source that mentions it (an event can have several sources; a source can mention several events).\nMet_Service_IDs: the official hazardous event IDs the Met Service shares (WMO Cataloguing of Hazardous Events), one row per ID, matched to Hazardous_Events.\nLookups: the allowed values for list fields.\nData dictionary: every field, whether it is required, and what it feeds.\nQA checks: counts that flag missing or suspect entries."),
("Three levels (DELTA-ready)","Hazardous_Events: the physical event (a storm, rain event, swell, dry spell), one row each.\nEvents: each impact at one place, linked to its hazardous event. Summary counts can be typed here for quick entry.\nHuman_Effects and Damage_Losses: optional detail for significant events, one row per group of people or per asset. Use them whenever a breakdown by sex, age, disability, sector or asset is known. Record physical quantities even when no cost is known; values can be added later.\nThis long format is what DELTA Resilience and the Global Disaster-Related Statistics Framework expect, so records can be exported without re-entry."),
("Cascades","Use parent_event_id to record knock-on events. Example: a landslide (EX-2025-0001) causes a road closure (EX-2025-0002). This is how the shared nodes between impact chains are measured.\nEnter the parent event first; the cell offers only existing event IDs. The link_check column at the far right of Events checks each row: the parent must exist, must not be the event itself, must not point back at its child, must not be a Duplicate or Rejected record (link to the original instead), must not start after the event it caused, and should share the same hazardous_event_id when both are filled. The QA checks sheet counts each problem."),
("Data origin and verification","Two separate questions, in two separate fields.\ndata_origin answers: who first saw or measured it? Unit field observation (a CRVA team member was there); Partner field monitoring (another unit or agency collected field data, e.g. the coastal unit's weekly beach photos); Official record (desk); Media or social media; Community report; Remote sensing.\nverification_status answers: how far has the CRVA team checked it?\nReported: not yet confirmed.\nDesk-verified: confirmed at the desk by one record from the mandated agency, about a claim within its mandate (authority = Mandated agency, within its mandate on the Sources sheet), or by two independent sources. A source that repeats another (repeats_source_id filled) never counts as the second source. The desk_rule column on Events shows whether the linked sources meet this rule.\nPartner-observed: a partner's own field data (dated, located photos or measurements) shows the event. The CRVA team has not visited. Name the partner in origin_agency.\nField-verified: the CRVA team has checked it on site and recorded the visit on the Field_Checks sheet (form THA-FV-01) with outcome Confirmed or Confirmed with corrections. Put the Visit ID in field_check_id. Nothing else counts as Field-verified: a partner's field data, however good, is Partner-observed.\nDuplicate: same event recorded twice; keep the row, set duplicate_of, and link its source to the original.\nRejected: not a real event or outside Tobago.\nExample: the coastal unit's photos show sargassum at Crown Point. Record data_origin = Partner field monitoring, status = Partner-observed. If the CRVA team then visits with the measuring staff or drone, add a Field_Checks row and change the status to Field-verified."),
("Tier 1 feed checks","The QA checks sheet also counts (Draft 0.6, from the alternate review): records with no impact field filled; rainfall-, storm- or swell-triggered events with no hazardous_event_id; Human_Effects or Damage_Losses detail that exceeds the Events totals; coastal events with no site or coordinate link; slow-onset indicators whose latest reading is more than 400 days old. All should read 0. The count of records ready for susceptibility training and the records-by-parish block are information for the GIS team and the completeness statement."),
("Event IDs","event_id is EV-YYYY-NNNN, where YYYY is the year the event happened (the year of date_start) when the ID is issued and NNNN is the next running number in that year. An ID never changes once issued, even if the date is corrected later, because sources, field checks, detail rows and the coastal unit's stranding record link to it. The QA checks list any ID whose year now differs from its date for information only. Hazardous event IDs (HE-YYYY-NNN) follow the same rule."),
("No countable impact","Every record needs at least one impact field. If an event caused no countable impact (a grass fire on open land, a sargassum stranding with nothing reported), say so in damage_desc, e.g. 'No impact beyond the hazard: open grassland burned'. Do not use notes for this: the QA check reads damage_desc."),
("Totals vs detail","Events holds the totals. Rows on Human_Effects and Damage_Losses are the breakdown and must not add up to more than the Events totals. Human_Effects rows are compared per as_of_date, so time-stamped displacement rows are not added together; Damage_Losses damage values are compared in TTD. The exceeds_total column on Human_Effects and the QA checks flag any record where detail exceeds the total."),
("Significant events (interim definition)","Until open question I4 is settled, an event is significant if there was any death, any building destroyed, a road closed for more than 24 hours, or any THA spending on the event on the Response_Funding sheet. The significant column on Events fills itself and says why. Use it to decide whether to fill Human_Effects, Damage_Losses and the loss and damage sheets."),
("Mandated agencies","One record from the agency mandated for a claim, about that claim, makes an event Desk-verified on its own. Met Service: rainfall, wind, warnings, storm tracks. TEMA / ODPM: disaster declarations, people affected, shelters, official damage assessments. Division of Infrastructure: road closures and road damage. WASA: water supply outages. IMA: marine heatwaves, coral bleaching, marine disease, sargassum science and offshore monitoring. Coastal Zone Management Unit: beach and coastal monitoring, sargassum stranding flags (TTSMP)."),
("WhatsApp reports","Source type WhatsApp or messaging app; authority Not official; publisher 'Member of the public via WhatsApp'. Never record the sender's name or number. One source per sender per event; a forwarded message repeats its original and is never a new source. Photos go only to the restricted Climate Unit Drive folder 'Community reports – restricted', never to the Commons and never to partners."),
("Geodata","If a source includes coordinates, shapes, a map or a GIS layer, set has_geodata = Y and send it to the GIS Specialist before using it anywhere else. Agency files are held in the Commons, with a link in geodata_link (WhatsApp location pins: the restricted folder). Coordinates from a source go on an event only once its gis_status reads Checked and loaded to the GeoPackage; record where every event's coordinates came from in coords_from."),
("Met Service IDs","When the Met Service shares its hazardous event IDs (open question I5), add one row per ID on Met_Service_IDs, including events that caused no recorded impacts in Tobago. When a row is matched, copy the ID into wmo_che_id on that Hazardous_Events row. The inventory's own HE- ID never changes."),
("Sargassum rule","Sargassum strands on Tobago's Atlantic beaches most weeks in season, so the inventory does not record every stranding.\nRecord a sargassum event when the Coastal Zone Management Unit flags a stranding Yellow or Red on the national stoplight (TTSMP), or flags it Green but it caused a reported impact: a facility or landing site blocked, health complaints, turtle nesting affected, business losses or clean-up spending.\nFill sargassum_flag and stranding_ref, cite the coastal unit's record as the source (data_origin = Partner field monitoring), and fill at least one impact field for a Green event.\nEvery stranding, of any class and including weeks with none, is kept by the coastal unit in the Sargassum Stranding Record. Frequency and persistence of sargassum come from that record, never from counts of inventory events."),
("Field checks","Field_Checks: one row per site visit by the CRVA team to check one event (paper or QField form THA-FV-01). Each row has a Visit ID (FC-YYYY-NNN) and the event_id it checks, so every Field-verified event can be traced to the visit, the team, the GPS point and the photos. A visit can also be a First-hand observation (the team saw the event itself) or a Follow-up visit (condition or recovery). Partner staff may come along, but at least one CRVA team member must be present for the visit to count. Field-visit photos are stored in the Commons, where field visits are tracked; put the link in commons_photos_link."),
("Location","Coordinates in UTM Zone 20N (EPSG:32620), metres. Record location_precision honestly: only GPS / RTK and road chainage records are used to train susceptibility models."),
("Workflow","1. Desk mining: TEMA reports, Infrastructure logs, WASA, Met Service, news since about 2010.\n2. Enter each event and each source; link them.\n3. Desk-verify where two sources agree.\n4. Field-check recent and large events with form THA-FV-01 (paper or QField); record each visit on Field_Checks and set the event to Field-verified only if the outcome is Confirmed or Confirmed with corrections.\n5. Weekly: GIS Specialist runs the QA checks and loads verified records into the GIS (GeoPackage layer 'events').\n6. Annually after the wet season: review the season's events against the hazard maps."),
("What to fill first","This is a small team, so every field and sheet carries a priority (see the Priorities sheet and the Data dictionary):\n1 Essential (Tier 1): needed for Tier 1 CRVA outputs. Fill for every record.\n2 Recommended: strengthens CRVA results and national reporting. Fill when the information is to hand.\n3 Loss & damage extension: for loss and damage, Sendai, DELTA and Loss and Damage Fund reporting. Fill for significant events only (open question I4); not needed for Tier 1.\nThe Priorities sheet also says what each field feeds in the CRVA."),
("Loss and damage sheets","Slow_Onset_Losses: losses that build up over years (beach width, well salinity), one row per indicator and place. Essential for the slow-onset signposts.\nEcosystem_Losses: change in extent and condition of reefs, seagrass, mangroves and beaches after an event, against a reference (FRAME-ECO approach).\nNon_Economic_Losses: losses that cannot be priced (health, heritage, identity, sense of place), using the UNFCCC categories. Record groups, never names; note consent.\nResponse_Funding: who paid for response and recovery, and how much. Shows the gap between losses and support.\nclimate_related on Events is filled automatically from the trigger, so climate loss and damage can be reported separately."),
("Example rows","All rows marked is_example = Y and IDs starting EX- are fictional training examples, not real Tobago events. Delete them before real data entry."),
("Cells to fill","Light yellow cells on the Events, Sources and Event_Sources sheets. Dark green headers mark required fields."),
("Standards","Fields follow the DesInventar methodology and the Sendai Framework indicators (UNDRR), so Tobago records can be exported to the national disaster loss database held by ODPM and to UNDRR's DELTA Resilience system that succeeds DesInventar Sendai. The 'Sendai crosswalk' sheet maps each field. Key DesInventar rules kept here: record every event with any impact, however small; one record per event per location; damage (physical) and losses (income and costs) kept separate; sources always cited."),
("Based on","DesInventar disaster loss database fields (UNDRR); CHARIM landslide and flood inventory guidance; the Tier 1 data register (d031 landslide inventory, d032 flood events, d034 loss and damage, d056 road closures)."),
]
y=4
for a,b in rows:
    r.cell(y,2,a).font=f(True); c=r.cell(y,3,b); c.font=f(); c.alignment=WR; r.cell(y,2).alignment=WR
    r.row_dimensions[y].height=15*(b.count("\n")+1+len(b)//100)+6; y+=1

# Lookups
lk=wb.create_sheet("Lookups")
for j,(k,vals) in enumerate(LOOK.items(),1):
    c=lk.cell(1,j,k); c.font=f(True,"FFFFFF"); c.fill=HEAD
    lk.column_dimensions[L(j)].width=max(16,max(len(v) for v in vals)+2)
    for i,v in enumerate(vals,2): lk.cell(i,j,v).font=f()
lkcol={k:L(j) for j,k in enumerate(LOOK,1)}
tcol=len(LOOK)+2
for j,h in enumerate(["trigger (map)","climate_related"]):
    c=lk.cell(1,tcol+j,h); c.font=f(True,"FFFFFF"); c.fill=HEAD; lk.column_dimensions[L(tcol+j)].width=40 if j==0 else 20
for i,(a,b) in enumerate(TRIGGER_CLIMATE,2):
    lk.cell(i,tcol,a).font=f(); lk.cell(i,tcol+1,b).font=f()
TMAP=f"Lookups!${L(tcol)}$2:${L(tcol+1)}${len(TRIGGER_CLIMATE)+1}"
def lkref(k): return f"Lookups!${lkcol[k]}$2:${lkcol[k]}${len(LOOK[k])+1}"

# Data dictionary
dd=wb.create_sheet("Data dictionary")
hdr=["Field","Type","Required","Allowed values","Description","Example","CRVA priority","Inputs to (CRVA)"]
for i,(h,w) in enumerate(zip(hdr,[22,10,9,28,60,24,22,48]),1):
    c=dd.cell(1,i,h); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX; dd.column_dimensions[L(i)].width=w
for k,(fld,ty,req,lku,desc,exv,feeds) in enumerate(FIELDS,2):
    vals=[fld,ty,req,(f"List: see Lookups column '{lku}'" if lku else ""),desc,exv,PRIO[fld][0],PRIO[fld][1]]
    for i,v in enumerate(vals,1): c=dd.cell(k,i,v); c.font=f(b=(i==1)); c.alignment=WR; c.border=BOX
dd.freeze_panes="B2"

# Events
ev=wb.create_sheet("Events",1)
NROW=200
for i,(fld,ty,req,lku,desc,exv,feeds) in enumerate(FIELDS,1):
    c=ev.cell(1,i,fld); c.font=f(True,"FFFFFF"); c.fill=REQ if req=="Y" else HEAD; c.border=BOX; c.alignment=Alignment(wrap_text=True,vertical="center")
    c.comment=Comment(f"{desc}\n\nPriority: {PRIO[fld][0]}\nFeeds: {PRIO[fld][1]}","Data dictionary")
    ev.column_dimensions[L(i)].width=max(12,min(34,len(fld)+4)) if fld not in("location_desc","notes","damage_desc") else 40
ev.row_dimensions[1].height=30
for rr in range(2,NROW+2):
    for i,(fld,ty,*_) in enumerate(FIELDS,1):
        c=ev.cell(rr,i); c.fill=INP; c.border=BOX; c.font=f(c="0000FF")
        if ty=="Date": c.number_format="yyyy-mm-dd"
        if fld in("easting","northing"): c.number_format="0"
for k,e in enumerate(EX,2):
    for i,(fld,*_) in enumerate(FIELDS,1):
        if fld in e:
            c=ev.cell(k,i,e[fld]); c.fill=EXF; c.font=f(c="5B6C70",i=True)
for i,(fld,ty,req,lku,*_) in enumerate(FIELDS,1):
    col=L(i); rng=f"{col}2:{col}{NROW+1}"
    if lku:
        dv=DataValidation(type="list",formula1=lkref(lku),allow_blank=True,showErrorMessage=True,error="Pick a value from the list"); ev.add_data_validation(dv); dv.add(rng)
    elif ty=="Date":
        dv=DataValidation(type="date",operator="between",formula1="DATE(1950,1,1)",formula2="DATE(2100,12,31)",allow_blank=True,error="Enter a date as YYYY-MM-DD"); ev.add_data_validation(dv); dv.add(rng)
    elif fld=="easting":
        dv=DataValidation(type="decimal",operator="between",formula1="733000",formula2="776000",allow_blank=True,showErrorMessage=True,error="Easting outside Tobago (UTM 20N 733000–776000)"); ev.add_data_validation(dv); dv.add(rng)
    elif fld=="northing":
        dv=DataValidation(type="decimal",operator="between",formula1="1231000",formula2="1259000",allow_blank=True,showErrorMessage=True,error="Northing outside Tobago (UTM 20N 1231000–1259000)"); ev.add_data_validation(dv); dv.add(rng)
    elif ty=="Number":
        dv=DataValidation(type="decimal",operator="greaterThanOrEqual",formula1="0",allow_blank=True,error="Enter a number of 0 or more"); ev.add_data_validation(dv); dv.add(rng)
ci=[x[0] for x in FIELDS].index("climate_related")+1; ti=[x[0] for x in FIELDS].index("trigger")+1
for rr in range(2,NROW+2):
    c=ev.cell(rr,ci,f'=IF({L(ti)}{rr}="","",IFERROR(VLOOKUP({L(ti)}{rr},{TMAP},2,FALSE),"Unclear"))'); c.fill=EXF; c.font=f()
FN_=[x[0] for x in FIELDS]; cl=lambda k: L(FN_.index(k)+1)
# significant: interim rule (open question I4), same test as the live inventory
si=FN_.index("significant")+1
for rr in range(2,NROW+2):
    why=(f'IF(N({cl("deaths")}{rr})>0,", death","")&IF(N({cl("buildings_destroyed")}{rr})>0,", building destroyed","")'
         f'&IF(N({cl("closure_hours")}{rr})>24,", road closed > 24 h","")'
         f'&IF(COUNTIFS(Response_Funding!$A$2:$A$201,$A{rr},Response_Funding!$B$2:$B$201,"THA")>0,", THA spending","")')
    c=ev.cell(rr,si,f'=IF($A{rr}="","",IF({why}="","No","Yes ("&MID({why},3,200)&")"))'); c.fill=EXF; c.font=f()
IDR=f"$A$2:$A${NROW+1}"; PC,DC,VC,HC,DUP=cl("parent_event_id"),cl("date_start"),cl("verification_status"),cl("hazardous_event_id"),cl("duplicate_of")
lc=len(FIELDS)+1
c=ev.cell(1,lc,"link_check"); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX; c.alignment=Alignment(wrap_text=True,vertical="center")
c.comment=Comment("Fills itself. Checks parent_event_id, duplicate_of and hazardous_event_id against the other records. OK, or the first problem found. Do not type here.","Data dictionary")
ev.column_dimensions[L(lc)].width=34
for rr in range(2,NROW+2):
    A,P,Dd,H,U=f"A{rr}",f"{PC}{rr}",f"{DC}{rr}",f"{HC}{rr}",f"{DUP}{rr}"
    fm=(f'=IF({A}="","",IF({P}<>"",IF({P}={A},"Parent is the event itself",IF(COUNTIF({IDR},{P})=0,"Parent ID not found",'
        f'IF(COUNTIFS({IDR},{P},${PC}$2:${PC}${NROW+1},{A})>0,"Parent and child point at each other",'
        f'IF(OR(COUNTIFS({IDR},{P},${VC}$2:${VC}${NROW+1},"Duplicate")>0,COUNTIFS({IDR},{P},${VC}$2:${VC}${NROW+1},"Rejected")>0),"Parent is a Duplicate or Rejected record",'
        f'IF(AND({Dd}<>"",SUMIFS(${DC}$2:${DC}${NROW+1},{IDR},{P})>{Dd}),"Parent starts after this event",'
        f'IF(AND({H}<>"",COUNTIFS({IDR},{P},${HC}$2:${HC}${NROW+1},"<>")>0,COUNTIFS({IDR},{P},${HC}$2:${HC}${NROW+1},{H})=0),"Parent has a different hazardous_event_id","OK")))))),'
        f'IF(AND({U}<>"",OR({U}={A},COUNTIF({IDR},{U})=0)),"duplicate_of not found",'
        f'IF(AND({H}<>"",COUNTIF(Hazardous_Events!$A$2:$A$121,{H})=0),"hazardous_event_id not found","OK"))))')
    c=ev.cell(rr,lc,fm); c.fill=EXF; c.font=f(); c.border=BOX
for k_ in ("parent_event_id","duplicate_of"):
    dv=DataValidation(type="list",formula1=f"=Events!{IDR}",allow_blank=True,showErrorMessage=True,errorStyle="warning",error="This is not an event_id on the Events sheet. Enter the parent event first, or check the ID."); ev.add_data_validation(dv); dv.add(f"{cl(k_)}2:{cl(k_)}{NROW+1}")
dv=DataValidation(type="list",formula1="=Hazardous_Events!$A$2:$A$121",allow_blank=True,showErrorMessage=True,errorStyle="warning",error="Not on the Hazardous_Events sheet. Add the hazardous event first."); ev.add_data_validation(dv); dv.add(f"{HC}2:{HC}{NROW+1}")
ev.conditional_formatting.add(f"{L(lc)}2:{L(lc)}{NROW+1}",FormulaRule(formula=[f'AND({L(lc)}2<>"",{L(lc)}2<>"OK")'],fill=PatternFill("solid",fgColor="F6C7C0")))
# desk_rule: do the linked sources meet the Desk-verified rule? (one mandated-agency record within its mandate, or two independent sources)
dc=lc+1
c=ev.cell(1,dc,"desk_rule"); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX; c.alignment=Alignment(wrap_text=True,vertical="center")
c.comment=Comment("Fills itself from Event_Sources and Sources. Meets: one record from the mandated agency within its mandate, or two independent sources (a source that repeats another counts once). Does not meet: the event should not be Desk-verified yet. Do not type here.","Data dictionary")
ev.column_dimensions[L(dc)].width=30
ESA="Event_Sources!$A$2:$A$401"; ESE="Event_Sources!$E$2:$E$401"; ESF="Event_Sources!$F$2:$F$401"
for rr in range(2,NROW+2):
    ind=f'SUMPRODUCT(({ESA}=$A{rr})*({ESF}<>"")/COUNTIFS({ESA},{ESA}&"",{ESF},{ESF}&""))'
    fm=(f'=IF($A{rr}="","",IF(COUNTIF({ESA},$A{rr})=0,"No source linked",IF(COUNTIFS({ESA},$A{rr},{ESE},"{AUTH_M}")>0,"Meets (mandated agency)",'
        f'IF({ind}>=2,"Meets ("&ROUND({ind},0)&" independent sources)","Does not meet"))))')
    c=ev.cell(rr,dc,fm); c.fill=EXF; c.font=f(); c.border=BOX
ev.conditional_formatting.add(f"{L(dc)}2:{L(dc)}{NROW+1}",FormulaRule(formula=[f'AND(${cl("verification_status")}2="Desk-verified",LEFT({L(dc)}2,5)<>"Meets")'],fill=PatternFill("solid",fgColor="F6C7C0")))
ev.freeze_panes="D2"; ev.auto_filter.ref=f"A1:{L(dc)}{NROW+1}"

# Sources
so=wb.create_sheet("Sources",2)
for i,(h,w,lku,req,desc) in enumerate(SRC_DEF,1):
    c=so.cell(1,i,h); c.font=f(True,"FFFFFF"); c.fill=REQ if req else HEAD; c.border=BOX; c.alignment=Alignment(wrap_text=True,vertical="center"); so.column_dimensions[L(i)].width=w
    if desc: c.comment=Comment(desc,"Data dictionary")
so.row_dimensions[1].height=30
sc=lambda k: L(SRC_COLS.index(k)+1)
for rr in range(2,152):
    for i in range(1,len(SRC_COLS)+1):
        c=so.cell(rr,i); c.fill=INP; c.border=BOX; c.font=f(c="0000FF")
    so.cell(rr,SRC_COLS.index("source_date")+1).number_format="yyyy-mm-dd"
for k,row in enumerate(SRC,2):
    for i,v in enumerate(row,1):
        if v is not None: c=so.cell(k,i,v); c.fill=EXF; c.font=f(c="5B6C70",i=True)
for i,(h,w,lku,req,desc) in enumerate(SRC_DEF,1):
    if lku:
        dv=DataValidation(type="list",formula1=lkref(lku),allow_blank=True,showErrorMessage=True,error="Pick a value from the list"); so.add_data_validation(dv); dv.add(f"{L(i)}2:{L(i)}151")
dv=DataValidation(type="date",operator="between",formula1="DATE(1950,1,1)",formula2="DATE(2100,12,31)",allow_blank=True,error="Enter a date as YYYY-MM-DD"); so.add_data_validation(dv); dv.add(f"{sc('source_date')}2:{sc('source_date')}151")
SRNG=lambda k: f"Sources!${sc(k)}$2:${sc(k)}$151"
so.freeze_panes="B2"

# Event_Sources
es=wb.create_sheet("Event_Sources",3)
for i,(h,w) in enumerate(zip(["event_id","source_id","event_found","source_found"],[16,14,13,13]),1):
    c=es.cell(1,i,h); c.font=f(True,"FFFFFF"); c.fill=HEAD if i>2 else REQ; c.border=BOX; es.column_dimensions[L(i)].width=w
for rr in range(2,402):
    for i in (1,2): c=es.cell(rr,i); c.fill=INP; c.border=BOX; c.font=f(c="0000FF")
    es.cell(rr,3,f'=IF(A{rr}="","",IF(COUNTIF(Events!$A$2:$A${NROW+1},A{rr})>0,"OK","Missing"))').font=f()
    es.cell(rr,4,f'=IF(B{rr}="","",IF(COUNTIF(Sources!$A$2:$A$151,B{rr})>0,"OK","Missing"))').font=f()
    es.cell(rr,5,f'=IF(OR(A{rr}="",B{rr}=""),"",IFERROR(INDEX({SRNG("authority")},MATCH(B{rr},Sources!$A$2:$A$151,0))&"",""))').font=f()
    es.cell(rr,6,f'=IF(OR(A{rr}="",B{rr}=""),"",IFERROR(IF(INDEX({SRNG("repeats_source_id")},MATCH(B{rr},Sources!$A$2:$A$151,0))&""="",B{rr},INDEX({SRNG("repeats_source_id")},MATCH(B{rr},Sources!$A$2:$A$151,0))&""),B{rr}))').font=f()
for j,(hh,desc,w) in enumerate([("source_authority","Fills itself: the source's authority from the Sources sheet. Used by desk_rule on Events.",30),("independent_of","Fills itself: the original this source repeats, or the source itself. Sources with the same value count as one independent source.",16)],5):
    c=es.cell(1,j,hh); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX; c.comment=Comment(desc,"Data dictionary"); es.column_dimensions[L(j)].width=w
for k,(a,b) in enumerate(LINK,2):
    for i,v in enumerate((a,b),1): c=es.cell(k,i,v); c.fill=EXF; c.font=f(c="5B6C70",i=True)

# Field_Checks columns (defined here so the QA checks can find them by name). Wording as in the live inventory.
FC_COLS=[("visit_id",14,None,True,"Unique visit ID: FC-YYYY-NNN, where YYYY is the year of the visit. One row per CRVA team site visit to check one event (form THA-FV-01)."),
("is_example",10,"yes_no",True,"Y for training examples."),
("event_id",16,None,True,"The event this visit checks (EV- ID from the Events sheet)."),
("check_type",30,"check_type",True,"Verification visit: the team goes out to check a record that came from someone else (a partner, the media, a report). First-hand observation: the team saw the event itself. Follow-up visit: condition or recovery."),
("visit_date",12,None,True,"Date of the visit."),
("team",30,None,True,"CRVA team members on the visit. At least one must be present for the check to count."),
("partner_present",26,None,False,"Partner staff who came along, e.g. coastal unit officer. Their presence does not replace a CRVA team member."),
("easting",11,None,True,"GPS easting at the event, UTM Zone 20N (EPSG:32620)."),
("northing",11,None,True,"GPS northing at the event."),
("gps_accuracy_m",10,None,False,"Accuracy shown by the GPS or phone, metres."),
("outcome",24,"check_outcome",True,"Confirmed or Confirmed with corrections: set the event to Field-verified and put this Visit ID in its field_check_id. Any other outcome leaves the event's status unchanged; set Duplicate or Rejected on the event if needed."),
("corrections",36,None,False,"What should change in the event record: location, date, size, type. Make the same change on the Events sheet."),
("measure_method",20,"measure_method",False,"How sizes were measured."),
("measurements",36,None,False,"Length, width, depth, volume, wrack-line height, staff readings."),
("condition_now",20,"condition_now",False,"State of the site on the visit date."),
("photo_ids",30,None,True,"At least two photos: a wide view and a close-up with a scale. Give their file names as stored in the Commons, separated by semicolons."),
("commons_photos_link",30,None,False,"Link to this visit's photos in the Commons (Field Work area). The photos are stored in the Commons, where the team tracks its field visits; the inventory only links to them."),
("evidence_link",30,None,False,"Other evidence, if any: a drone orthomosaic or a video (https://). Photos go in commons_photos_link."),
("event_found",12,None,False,"Calculated: OK if event_id exists on Events. Do not type here."),
("recorded_by",18,None,True,"Who entered this visit."),
("notes",40,None,False,"Anything else.")]
FC_ROWS=[["FC-EX-001","Y","EX-2025-0001","Verification visit (checks an existing record)",D(2025,11,20),"Research Associate 1; GIS Specialist","Division of Infrastructure road officer (example)",763712,1244893,5,"Confirmed with corrections","Point moved 14 m to the centre of the scar; width 12 m (log said 20 m)","Tape or measuring staff","Scar 35 m long, 12 m wide; debris about 150 m3",'Cleared or repaired',"EX0001_01.jpg; EX0001_02.jpg",None,None,None,"Research Associate 1","Fictional. Desk record from the road log, checked on site."],
["FC-EX-002","Y","EX-2026-0006","First-hand observation (team saw the event)",D(2026,4,16),"Research Associate 2",None,742600,1241000,4,"Confirmed",None,"GPS walk-over","Burnt area walked with GPS: about 2 ha","Still present","EX0006_01.jpg; EX0006_02.jpg",None,None,None,"Research Associate 2","Fictional. Team member was on site during the fire."],
["FC-EX-003","Y","EX-2026-0007","Verification visit (checks an existing record)",D(2026,6,15),"Research Associate 1; GIS Specialist (drone pilot)","Coastal unit officer (example)",768800,1250100,3,"Confirmed with corrections","Volume 300 m3 from the drone survey replaces the visual estimate in the photo log","Drone (UAS) survey","Mat about 120 m along the shore; staff depths at 5 points; volume about 300 m3","Still present","EX0007_01.jpg; EX0007_UAS_ortho.tif",None,None,None,"Research Associate 1","Fictional. Event first came from the coastal unit's photos (Partner-observed); this visit makes it Field-verified."]]
FCK=[c[0] for c in FC_COLS]; assert all(len(r)==len(FCK) for r in FC_ROWS)
fcl=lambda k: L(FCK.index(k)+1)
FCR=lambda k: f"Field_Checks!${fcl(k)}$2:${fcl(k)}$201"
# Met_Service_IDs columns (live inventory tab "Met Service IDs"; open question I5)
MS_COLS=[("met_record_id",13,None,True,"Row ID: MS-NNN."),
("is_example",10,"yes_no",True,"Y for training examples."),
("wmo_che_id",22,None,True,"The hazardous event ID exactly as the Met Service issued it (WMO Cataloguing of Hazardous Events). Copy it character for character."),
("met_event_name",24,None,False,"Name or description the Met Service gives the event."),
("hazard",24,"he_hazard",True,"Hazard type, from the same list as the Hazardous_Events sheet."),
("date_start",12,None,True,"Start date as given by the Met Service."),
("date_end",12,None,False,"End date as given by the Met Service."),
("match_status",28,"met_match",True,"Matched: this ID belongs to a hazardous event in the inventory (fill hazardous_event_id). No impacts recorded: the event affected Tobago's weather but no impacts are on record. Not yet checked: not compared yet."),
("hazardous_event_id",16,None,False,"The inventory's own HE- ID for the same event. Copy the Met Service ID into wmo_che_id on that Hazardous_Events row. The HE- ID itself never changes."),
("date_received",12,None,False,"Date the unit received this ID."),
("received_from",24,None,False,"Met Service office, contact role or document it came in (no private names)."),
("reference_or_url",28,None,False,"File, letter or web reference for the list of IDs."),
("notes",40,None,False,"")]
MSK=[c[0] for c in MS_COLS]
msl=lambda k: L(MSK.index(k)+1)
MSR=lambda k: f"Met_Service_IDs!${msl(k)}$2:${msl(k)}$101"

# QA
qa=wb.create_sheet("QA checks",4)
qa.column_dimensions["A"].width=58; qa.column_dimensions["B"].width=12
qa["A1"]="QA checks (update automatically)"; qa["A1"].font=f(True,TEAL,14)
idx={fld:L(i) for i,(fld,*_) in enumerate(FIELDS,1)}
R=f"2:{NROW+1}"
def rg(fld): c=idx[fld]; return f"Events!${c}$2:${c}${NROW+1}"
checks=[("Records entered (any)",f'=COUNTA({rg("event_id")})'),
("  of which training examples (is_example = Y)",f'=COUNTIF({rg("is_example")},"Y")'),
("Real records",f'=B3-B4'),
("Required field missing: event_type",f'=COUNTIFS({rg("event_id")},"<>",{rg("event_type")},"")'),
("Required field missing: trigger",f'=COUNTIFS({rg("event_id")},"<>",{rg("trigger")},"")'),
("Required field missing: date_start",f'=COUNTIFS({rg("event_id")},"<>",{rg("date_start")},"")'),
("Required field missing: parish",f'=COUNTIFS({rg("event_id")},"<>",{rg("parish")},"")'),
("Required field missing: verification_status",f'=COUNTIFS({rg("event_id")},"<>",{rg("verification_status")},"")'),
("Coordinates missing where precision is better than Parish only",f'=COUNTIFS({rg("event_id")},"<>",{rg("location_precision")},"<>Parish only",{rg("easting")},"")'),
("Duplicate records without duplicate_of",f'=COUNTIFS({rg("verification_status")},"Duplicate",{rg("duplicate_of")},"")'),
("Road closures without closure_hours",f'=COUNTIFS({rg("event_type")},"Road closure",{rg("closure_hours")},"")+COUNTIFS({rg("event_type")},"<>Road closure",{rg("road_closed")},"Y",{rg("closure_hours")},"")'),
("Events with no linked source",f'=SUMPRODUCT(({rg("event_id")}<>"")*(COUNTIF(Event_Sources!$A$2:$A$401,{rg("event_id")})=0))'),
("Events with a cost but no price_year",f'=COUNTIFS({rg("est_cost_ttd")},"<>",{rg("price_year")},"")+COUNTIFS({rg("est_cost_ttd")},"",{rg("est_loss_ttd")},"<>",{rg("price_year")},"")'),
("Non-economic loss rows without consent recorded",'=COUNTIFS(Non_Economic_Losses!$A$2:$A$151,"<>",Non_Economic_Losses!$I$2:$I$151,"<>Y")'),
("Slow-onset rows missing a baseline or current value",'=COUNTIFS(Slow_Onset_Losses!$A$2:$A$151,"<>",Slow_Onset_Losses!$H$2:$H$151,"")+COUNTIFS(Slow_Onset_Losses!$A$2:$A$151,"<>",Slow_Onset_Losses!$H$2:$H$151,"<>",Slow_Onset_Losses!$J$2:$J$151,"")'),
("Required field missing: data_origin",f'=COUNTIFS({rg("event_id")},"<>",{rg("data_origin")},"")'),
("Partner field monitoring without origin_agency",f'=COUNTIFS({rg("data_origin")},"Partner field monitoring",{rg("origin_agency")},"")'),
("Field-verified events without a confirming field check (Field_Checks outcome Confirmed…)",f'=SUMPRODUCT(({rg("verification_status")}="Field-verified")*(COUNTIFS({FCR("event_id")},{rg("event_id")},{FCR("outcome")},"Confirmed*")=0))'),
("Field-verified events without field_check_id",f'=COUNTIFS({rg("verification_status")},"Field-verified",{rg("field_check_id")},"")'),
("field_check_id not found on Field_Checks",f'=SUMPRODUCT(({rg("field_check_id")}<>"")*(COUNTIF({FCR("visit_id")},{rg("field_check_id")})=0))'),
("Field checks linked to a missing event",f'=COUNTIF({FCR("event_found")},"Missing")'),
("Field checks missing team, date, GPS point or photos",f'=SUMPRODUCT(({FCR("visit_id")}<>"")*((({FCR("team")}="")+({FCR("visit_date")}="")+({FCR("easting")}="")+({FCR("northing")}="")+({FCR("photo_ids")}=""))>0))'),
("Field checks without a link to their photos in the Commons (commons_photos_link)",f'=COUNTIFS({FCR("visit_id")},"<>",{FCR("is_example")},"<>Y",{FCR("commons_photos_link")},"")'),
("SOURCES AND DESK VERIFICATION",None),
("Desk-verified events that do not meet the rule (one record from the mandated agency within its mandate, or two independent sources; see desk_rule on Events)",f'=SUMPRODUCT(({rg("verification_status")}="Desk-verified")*(LEFT(Events!${L(len(FIELDS)+2)}$2:${L(len(FIELDS)+2)}${NROW+1},5)<>"Meets"))'),
("For information: Reported events that already meet the Desk-verified rule",f'=SUMPRODUCT(({rg("verification_status")}="Reported")*({rg("is_example")}<>"Y")*(LEFT(Events!${L(len(FIELDS)+2)}$2:${L(len(FIELDS)+2)}${NROW+1},5)="Meets"))'),
("Partner field monitoring sources without the partner's record IDs (agency_record_ids)",f'=COUNTIFS({SRNG("source_type")},"Partner field monitoring",{SRNG("agency_record_ids")},"")'),
("Sources marked as repeating themselves",f'=SUMPRODUCT(({SRNG("repeats_source_id")}<>"")*({SRNG("repeats_source_id")}=Sources!$A$2:$A$151))'),
("Sources marked original_held = Y whose original is not entered as a source",f'=SUMPRODUCT(({SRNG("repeats_source_id")}<>"")*({SRNG("original_held")}="Y")*(COUNTIF(Sources!$A$2:$A$151,{SRNG("repeats_source_id")})=0))'),
("WhatsApp sources not marked authority = Not official",f'=COUNTIFS({SRNG("source_type")},"WhatsApp or messaging app",{SRNG("authority")},"<>Not official")'),
("Sources with geodata not yet checked and loaded by the GIS Specialist",f'=COUNTIFS({SRNG("has_geodata")},"Y",{SRNG("gis_status")},"<>Checked and loaded to the GeoPackage",{SRNG("gis_status")},"<>Not usable (explain in notes)")'),
("For information: sources with geodata not yet linked in the Commons (WhatsApp excluded)",f'=COUNTIFS({SRNG("has_geodata")},"Y",{SRNG("geodata_link")},"",{SRNG("source_type")},"<>WhatsApp or messaging app")'),
("Events with coordinates but no record of where they came from (coords_from)",f'=COUNTIFS({rg("event_id")},"<>",{rg("is_example")},"<>Y",{rg("easting")},"<>",{rg("coords_from")},"")'),
("Events whose coordinates come from a source the GIS Specialist has not loaded yet",f'=SUMPRODUCT(({rg("coords_from")}<>"")*(COUNTIFS(Sources!$A$2:$A$151,{rg("coords_from")},{SRNG("has_geodata")},"Y")>0)*(COUNTIFS(Sources!$A$2:$A$151,{rg("coords_from")},{SRNG("gis_status")},"Checked and loaded to the GeoPackage")=0))'),
("MET SERVICE IDS",None),
("Met Service IDs marked Matched with no hazardous_event_id",f'=COUNTIFS({MSR("match_status")},"Matched to a hazardous event",{MSR("hazardous_event_id")},"")'),
("Met Service IDs linked to a hazardous event that does not exist",f'=SUMPRODUCT(({MSR("hazardous_event_id")}<>"")*(COUNTIF(Hazardous_Events!$A$2:$A$121,{MSR("hazardous_event_id")})=0))'),
("Hazardous events whose wmo_che_id differs from the Met_Service_IDs sheet",f'=SUMPRODUCT(({MSR("hazardous_event_id")}<>"")*(COUNTIF(Hazardous_Events!$A$2:$A$121,{MSR("hazardous_event_id")})>0)*(COUNTIFS(Hazardous_Events!$A$2:$A$121,{MSR("hazardous_event_id")},Hazardous_Events!$G$2:$G$121,{MSR("wmo_che_id")})=0))'),
("For information: Met Service IDs not yet checked against the inventory",f'=COUNTIF({MSR("match_status")},"Not yet checked")'),
("EVENTS (continued)",None),
("Cause links: parent_event_id not found",f'=SUMPRODUCT(({rg("parent_event_id")}<>"")*(COUNTIF({rg("event_id")},{rg("parent_event_id")})=0))'),
("Cause links: event lists itself as its parent",f'=SUMPRODUCT(({rg("parent_event_id")}<>"")*({rg("parent_event_id")}={rg("event_id")}))'),
("Cause links: parent and child point at each other",f'=SUMPRODUCT(({rg("parent_event_id")}<>"")*({rg("parent_event_id")}<>{rg("event_id")})*(COUNTIFS({rg("event_id")},{rg("parent_event_id")},{rg("parent_event_id")},{rg("event_id")})>0))'),
("Cause links: parent is a Duplicate or Rejected record (point at the original)",f'=SUMPRODUCT(({rg("parent_event_id")}<>"")*((COUNTIFS({rg("event_id")},{rg("parent_event_id")},{rg("verification_status")},"Duplicate")+COUNTIFS({rg("event_id")},{rg("parent_event_id")},{rg("verification_status")},"Rejected"))>0))'),
("Cause links: parent starts after the event it caused",f'=SUMPRODUCT(({rg("parent_event_id")}<>"")*({rg("date_start")}<>"")*(SUMIFS({rg("date_start")},{rg("event_id")},{rg("parent_event_id")})>{rg("date_start")}))'),
("Cause links: parent has a different hazardous_event_id",f'=SUMPRODUCT(({rg("parent_event_id")}<>"")*({rg("hazardous_event_id")}<>"")*(COUNTIFS({rg("event_id")},{rg("parent_event_id")},{rg("hazardous_event_id")},"<>")>0)*(COUNTIFS({rg("event_id")},{rg("parent_event_id")},{rg("hazardous_event_id")},{rg("hazardous_event_id")})=0))'),
("duplicate_of not found",f'=SUMPRODUCT(({rg("duplicate_of")}<>"")*(COUNTIF({rg("event_id")},{rg("duplicate_of")})=0))'),
("hazardous_event_id not on Hazardous_Events",f'=SUMPRODUCT(({rg("hazardous_event_id")}<>"")*(COUNTIF(Hazardous_Events!$A$2:$A$121,{rg("hazardous_event_id")})=0))'),
("Sargassum events without a stoplight flag",f'=COUNTIFS({rg("event_type")},"Sargassum influx",{rg("sargassum_flag")},"")'),
("Green sargassum events with no impact recorded (rule: Yellow, Red, or Green with impact)",f'=COUNTIFS({rg("event_type")},"Sargassum influx",{rg("sargassum_flag")},"Green",{rg("people_affected")},"",{rg("livelihoods_disrupted")},"",{rg("facilities_affected")},"",{rg("damage_desc")},"",{rg("est_cost_ttd")},"",{rg("est_loss_ttd")},"")'),
("TIER 1 FEED CHECKS (Draft 0.6)",None),
("Records with no impact field filled (every real record needs at least one impact field; if none, explain in damage_desc)",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*({rg("verification_status")}<>"Rejected")*({rg("verification_status")}<>"Duplicate")*({rg("road_closed")}<>"Y")*({rg("people_affected")}="")*({rg("people_displaced")}="")*({rg("people_relocated")}="")*({rg("livelihoods_disrupted")}="")*({rg("injuries")}="")*({rg("deaths")}="")*({rg("missing")}="")*({rg("disaggregation")}="")*({rg("buildings_damaged")}="")*({rg("buildings_destroyed")}="")*({rg("dwellings_damaged")}="")*({rg("dwellings_destroyed")}="")*({rg("education_facilities_damaged")}="")*({rg("health_facilities_damaged")}="")*({rg("roads_damaged_m")}="")*({rg("crops_ha")}="")*({rg("livestock_lost")}="")*({rg("boats_damaged")}="")*({rg("heritage_damaged")}="")*({rg("facilities_affected")}="")*({rg("utilities_affected")}="")*({rg("damage_desc")}="")*({rg("est_cost_ttd")}="")*({rg("est_loss_ttd")}="")*({rg("closure_hours")}=""))'),
("Rainfall-, storm- or swell-triggered events with no hazardous_event_id",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*({rg("verification_status")}<>"Rejected")*({rg("verification_status")}<>"Duplicate")*ISNUMBER(MATCH({rg("trigger")},{{"Heavy rainfall","Tropical storm / hurricane","Swell / high waves"}},0))*({rg("hazardous_event_id")}=""))'),
("Human_Effects rows whose group total exceeds the Events total (same variable and as_of_date)",'=COUNTIF(Human_Effects!$L$2:$L$301,"Exceeds Events total")'),
("Damage_Losses damage value (TTD) exceeding the Events est_cost_ttd total",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*({rg("est_cost_ttd")}<>"")*((SUMIFS(Damage_Losses!$J$2:$J$301,Damage_Losses!$A$2:$A$301,{rg("event_id")},Damage_Losses!$I$2:$I$301,"Damage (repair or replacement)",Damage_Losses!$K$2:$K$301,"TTD")+SUMIFS(Damage_Losses!$J$2:$J$301,Damage_Losses!$A$2:$A$301,{rg("event_id")},Damage_Losses!$I$2:$I$301,"Damage (repair or replacement)",Damage_Losses!$K$2:$K$301,""))>{rg("est_cost_ttd")}))'),
("Coastal events with no site_id or coordinates (cannot be joined to a coastal segment)",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*({rg("verification_status")}<>"Rejected")*({rg("verification_status")}<>"Duplicate")*ISNUMBER(MATCH({rg("event_type")},{{"Coastal overtopping / flooding","Coastal erosion episode","Sargassum influx","Storm surge flooding"}},0))*({rg("site_id")}="")*({rg("easting")}="")*({rg("northing")}=""))'),
("Slow-onset indicators whose latest reading is more than 400 days old",'=SUMPRODUCT((Slow_Onset_Losses!$A$2:$A$151<>"")*(Slow_Onset_Losses!$B$2:$B$151<>"Y")*(Slow_Onset_Losses!$K$2:$K$151<>"")*(Slow_Onset_Losses!$K$2:$K$151<TODAY()-400)*(COUNTIFS(Slow_Onset_Losses!$D$2:$D$151,Slow_Onset_Losses!$D$2:$D$151,Slow_Onset_Losses!$F$2:$F$151,Slow_Onset_Losses!$F$2:$F$151,Slow_Onset_Losses!$K$2:$K$151,">"&Slow_Onset_Losses!$K$2:$K$151)=0))'),
("For information: verified landslide and flood records precise enough for susceptibility training (GPS or road chainage); set a target per hazard",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*ISNUMBER(MATCH({rg("verification_status")},{{"Desk-verified","Partner-observed","Field-verified"}},0))*ISNUMBER(MATCH({rg("location_precision")},{{"GPS / RTK (< 10 m)","Road chainage (< 100 m)"}},0))*ISNUMBER(MATCH({rg("event_type")},{{"Landslide","Rockfall","Debris flow","Flash flood","River flood","Urban / surface-water flood"}},0)))'),
("For information: event IDs whose year differs from the year of date_start (expected after a date correction; never renumber)",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*({rg("date_start")}<>"")*(MID({rg("event_id")},4,4)<>(""&YEAR({rg("date_start")}))))'),
("For information: significant events under the interim rule (death, building destroyed, road closed > 24 h, or THA spending; open question I4)",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*(LEFT({rg("significant")},3)="Yes"))'),
("For information: significant events with no loss and damage detail rows yet",f'=SUMPRODUCT(({rg("event_id")}<>"")*({rg("is_example")}<>"Y")*(LEFT({rg("significant")},3)="Yes")*((COUNTIF(Human_Effects!$A$2:$A$301,{rg("event_id")})+COUNTIF(Damage_Losses!$A$2:$A$301,{rg("event_id")})+COUNTIF(Ecosystem_Losses!$A$2:$A$151,{rg("event_id")})+COUNTIF(Non_Economic_Losses!$A$2:$A$151,{rg("event_id")})+COUNTIF(Response_Funding!$A$2:$A$201,{rg("event_id")}))=0))'),
("Links pointing to a missing event or source",f'=COUNTIF(Event_Sources!$C$2:$C$401,"Missing")+COUNTIF(Event_Sources!$D$2:$D$401,"Missing")'),
]
qa["A2"]="Check"; qa["B2"]="Count"
for c in (qa["A2"],qa["B2"]): c.font=f(True,"FFFFFF"); c.fill=HEAD
for k,(a,b) in enumerate(checks,3):
    if b is None:
        qa.cell(k,1,a).font=f(True,TEAL); continue
    qa.cell(k,1,a).font=f(); qa.cell(k,2,b).font=f(True); qa.cell(k,1).border=BOX; qa.cell(k,2).border=BOX; qa.cell(k,1).alignment=WR
base=3+len(checks)+1
qa.cell(base,1,"Records by type and verification status").font=f(True,TEAL,12)
sts=LOOK["verification_status"]
qa.cell(base+1,1,"Event type").font=f(True,"FFFFFF"); qa.cell(base+1,1).fill=HEAD
for j,s in enumerate(sts,2):
    c=qa.cell(base+1,j,s); c.font=f(True,"FFFFFF"); c.fill=HEAD; qa.column_dimensions[L(j)].width=14
for i,t in enumerate(LOOK["event_type"]):
    rr=base+2+i; qa.cell(rr,1,t).font=f(); qa.cell(rr,1).border=BOX
    for j,s in enumerate(sts,2):
        c=qa.cell(rr,j,f'=COUNTIFS({rg("event_type")},$A{rr},{rg("verification_status")},{L(j)}${base+1})'); c.font=f(); c.border=BOX
pb_=base+2+len(LOOK["event_type"])+1
qa.cell(pb_,1,"Records by parish (for the completeness statement that accompanies the screening matrix)").font=f(True,TEAL,12)
for j,hh in enumerate(["Parish","Records (real)","Verified (desk, partner or field)"],1):
    c=qa.cell(pb_+1,j,hh); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX
for i,pa in enumerate(LOOK["parish"]):
    rr=pb_+2+i; qa.cell(rr,1,pa).font=f(); qa.cell(rr,1).border=BOX
    qa.cell(rr,2,f'=COUNTIFS({rg("parish")},$A{rr},{rg("is_example")},"<>Y")').border=BOX
    qa.cell(rr,3,"="+"+".join(f'COUNTIFS({rg("parish")},$A{rr},{rg("is_example")},"<>Y",{rg("verification_status")},"{v}")' for v in ("Desk-verified","Partner-observed","Field-verified"))).border=BOX
# ---------- DELTA-ready detail tables ----------
def long_sheet(name,cols,rows,n=300,pos=None):
    sh=wb.create_sheet(name) if pos is None else wb.create_sheet(name,pos)
    for i,(h,w,lk,req,desc) in enumerate(cols,1):
        c=sh.cell(1,i,h); c.font=f(True,"FFFFFF"); c.fill=REQ if req else HEAD; c.border=BOX; c.alignment=Alignment(wrap_text=True,vertical="center")
        c.comment=Comment(desc,"Data dictionary"); sh.column_dimensions[L(i)].width=w
    sh.row_dimensions[1].height=30
    for rr in range(2,n+2):
        for i,(h,*_) in enumerate(cols,1):
            c=sh.cell(rr,i); c.fill=INP; c.border=BOX; c.font=f(c="0000FF")
    for k,row in enumerate(rows,2):
        for i,v in enumerate(row,1):
            if v is not None: c=sh.cell(k,i,v); c.fill=EXF; c.font=f(c="5B6C70",i=True)
    for i,(h,w,lk,req,desc) in enumerate(cols,1):
        if lk:
            dv=DataValidation(type="list",formula1=lkref(lk),allow_blank=True,showErrorMessage=True,error="Pick a value from the list"); sh.add_data_validation(dv); dv.add(f"{L(i)}2:{L(i)}{n+1}")
    sh.freeze_panes="B2"
    for i,(h,*_) in enumerate(cols,1):
        if "date" in h:
            for rr in range(2,n+2): sh.cell(rr,i).number_format="yyyy-mm-dd"
    return sh
HE_COLS=[("hazardous_event_id",16,None,True,"HE-YYYY-NNN, where YYYY is the year of date_start. One row per storm, rain spell, swell episode, dry spell or other physical event. Never changed afterwards."),
("record_uuid",14,None,False,"Filled automatically in the GeoPackage. Never edit."),
("is_example",10,"yes_no",True,"Y for training examples."),
("hazard",26,"he_hazard",True,"The physical event that caused the impacts: the weather, sea or earth event, not its effects. Pick Heavy rainfall, not Landslide or Flash flood; record landslides, floods and closures on the Events sheet and link them here. Map to the 2025 UNDRR–ISC Hazard Information Profile in hip_name_or_code."),
("hip_name_or_code",22,None,False,"Hazard Information Profile name or code (2025 list), agreed with ODPM."),
("event_name",22,None,False,"Named storm or local name."),
("wmo_che_id",18,None,False,"Hazardous event ID issued by the Met Service under WMO Cataloguing of Hazardous Events. Copy it from the matching row on the Met_Service_IDs sheet."),
("glide_no",18,None,False,"GLIDE number, if issued."),
("date_start",12,None,True,"Start of the physical event."),
("date_end",12,None,False,"End of the physical event."),
("max_24h_rain_mm",12,None,False,"Highest 24-hour rainfall at any Tobago gauge."),
("max_wind_kt",10,None,False,"Highest sustained wind, knots."),
("max_water_level_m",12,None,False,"Highest observed water level above datum, metres."),
("warning_issued",10,"yes_no",False,"Was an official warning issued before impacts?"),
("warning_lead_time_h",12,None,False,"Hours between the warning and the first impact."),
("source_ids",18,None,False,"Source IDs from the Sources sheet, separated by semicolons."),
("notes",40,None,False,""),
("climate_related",16,"climate_flag",False,"Climate-related, Not climate-related or Unclear. Used to report climate loss and damage separately.")]
HE_ROWS=[["HE-EX-001",None,"Y","Heavy rainfall","(fill from 2025 HIP list)","Example rain event",None,None,D(2025,11,11),D(2025,11,12),142,None,None,"Y",18,"EX-SRC-001","Fictional. Caused EX-2025-0001 and EX-2025-0002.","Climate-related"],
["HE-EX-002",None,"Y","Heavy rainfall","(fill from 2025 HIP list)","Example squall",None,None,D(2025,10,28),D(2025,10,28),88,None,None,"N",None,"EX-SRC-003","Fictional.","Climate-related"]]
long_sheet("Hazardous_Events",HE_COLS,HE_ROWS,120,pos=2)
HU_COLS=[("event_id",16,None,True,"Effect record ID from the Events sheet."),
("variable",24,"effect_variable",True,"Which human effect."),
("sex",10,"sex",True,"Use Unknown when not reported."),
("age_group",10,"age_group",True,"Use Unknown when not reported."),
("disability",10,"disability",True,"Use Unknown when not reported."),
("count",8,None,True,"Number of people (or households for livelihoods)."),
("as_of_date",12,None,False,"Date the count applies to. Needed for displacement, which changes over time."),
("end_date",12,None,False,"For evacuation or displacement: date people returned, if known."),
("source_id",14,None,False,""),("notes",40,None,False,"")]
HU_ROWS=[["EX-2025-0003","Directly affected","Unknown","Unknown","Unknown",40,D(2025,10,28),None,"EX-SRC-003","Fictional. Total only; no breakdown reported."],
["EX-2025-0003","Evacuated","Female","65+","No",2,D(2025,10,28),D(2025,10,30),"EX-SRC-004","Fictional. Two older women stayed with relatives for two nights."]]
hu_sh=long_sheet("Human_Effects",HU_COLS,HU_ROWS,300,pos=3)
HUMAP=[("Directly affected","people_affected"),("Evacuated","people_displaced"),("Relocated","people_relocated"),("Deaths","deaths"),("Missing","missing"),("Injured or ill","injuries"),("Livelihood disrupted (households)","livelihoods_disrupted")]
for j,(hh,desc) in enumerate([("events_total","Fills itself: the matching total on Events for this variable (people_affected for Directly affected, people_displaced for Evacuated, and so on). Blank if Events has no total."),("exceeds_total","Fills itself: 'Exceeds Events total' if the rows for this event, variable and as_of_date add up to more than the Events total.")],11):
    c=hu_sh.cell(1,j,hh); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX; c.alignment=Alignment(wrap_text=True,vertical="center"); c.comment=Comment(desc,"Data dictionary"); hu_sh.column_dimensions[L(j)].width=14
EVID=f"Events!$A$2:$A${NROW+1}"
for rr in range(2,302):
    expr='""'
    for v,fld in reversed(HUMAP):
        col_=f"Events!${idx[fld]}$2:${idx[fld]}${NROW+1}"
        got=f"INDEX({col_},MATCH($A{rr},{EVID},0))"
        expr=f'IF($B{rr}="{v}",IFERROR(IF({got}="","",{got}),""),{expr})'
    c=hu_sh.cell(rr,11,f'=IF(OR($A{rr}="",$B{rr}=""),"",{expr})'); c.fill=EXF; c.font=f(); c.border=BOX
    c=hu_sh.cell(rr,12,f'=IF(OR(K{rr}="",F{rr}=""),"",IF(SUMIFS($F$2:$F$301,$A$2:$A$301,$A{rr},$B$2:$B$301,$B{rr},$G$2:$G$301,$G{rr}&"")>K{rr},"Exceeds Events total","OK"))'); c.fill=EXF; c.font=f(); c.border=BOX
DL_COLS=[("event_id",16,None,True,"Effect record ID from the Events sheet."),
("sector",34,"sector",True,"PDNA / DELTA sector grouping."),
("asset_type",24,None,True,"What was affected, e.g. road, house, school, fishing boat, mangrove, beach."),
("asset_id",14,None,False,"Site & Asset Register or facility ID, if known."),
("unit",10,"unit",True,"Physical unit for the quantity."),
("quantity",10,None,True,"Physical amount affected. Record this even when no cost is known."),
("damage_state",20,"damage_state",True,""),
("disruption_days",10,None,False,"Days the service or asset was out of use."),
("value_type",30,"value_type",False,"Damage, loss or additional cost, kept separate."),
("value_local",12,None,False,"Value in the currency below."),
("currency",8,None,False,"ISO code, e.g. TTD."),
("price_year",9,None,False,"Year the value is priced in, so it can be adjusted for inflation later."),
("valuation",20,"valuation",False,"How the value was obtained."),
("source_id",14,None,False,""),("notes",40,None,False,""),
("recovery_status",16,"recovery_status",False,"Has the asset or service recovered? Update at later visits."),
("recovery_date",12,None,False,"Date it recovered or was replaced.")]
DL_ROWS=[["EX-2025-0001","Infrastructure: Transport","Road (both lanes)",None,"m",35,"Partially damaged",1,"Damage (repair or replacement)",85000,"TTD",2025,"Reported cost","EX-SRC-001","Fictional.","Recovered",D(2026,2,10)],
["EX-2025-0001","Infrastructure: Transport","Slide debris clearance",None,"m3",150,"Disrupted (no physical damage)",1,"Additional cost (clean-up, response, temporary measures)",12000,"TTD",2025,"Quantity × unit cost","EX-SRC-001","Fictional. 150 m3 × TT$80.","Recovered",D(2025,11,13)],
["EX-2025-0003","Productive: Commerce and industry","Shop stock",None,"count",6,"Partially damaged",3,"Loss (income forgone)",None,None,None,None,"EX-SRC-004","Fictional. Physical count recorded; value not yet known.","Unknown",None]]
long_sheet("Damage_Losses",DL_COLS,DL_ROWS,300,pos=4)
SO_COLS=[("slow_onset_id",14,None,True,"SO-YYYY-NNN. One row per indicator, place and period."),
("is_example",10,"yes_no",True,"Y for training examples."),
("hazard",24,"slow_hazard",True,"Slow-onset hazard."),
("indicator",30,None,True,"What is measured, e.g. dry beach width at a profile, well conductivity, land area lost."),
("unit",10,None,True,"Unit of the indicator, e.g. m, m2, µS/cm, %."),
("place",26,None,True,"Profile, well, segment or village."),
("seg_id",12,None,False,"Coastal segment ID, if coastal."),
("baseline_value",11,None,True,"Earliest reliable value."),
("baseline_date",12,None,True,"Date of the baseline value."),
("current_value",11,None,True,"Latest value."),
("current_date",12,None,True,"Date of the latest value."),
("change",11,None,False,"Calculated: current minus baseline. Do not type here."),
("loss_description",40,None,False,"What has been lost because of the change, e.g. boat haul-out no longer possible, well abandoned for irrigation."),
("assets_people_affected",30,None,False,"Assets, households or groups affected (no names)."),
("evidence",24,None,False,"How it was measured: levelled beach profile (IMA method), RTK, CoastSat, conductivity meter, interviews."),
("signpost",22,None,False,"DAPP signpost this indicator feeds, and its agreed threshold if set (question I2)."),
("confidence",10,"confidence",False,""),
("source_id",14,None,False,""),("notes",40,None,False,"")]
SO_ROWS=[["SO-EX-001","Y","Coastal erosion","Dry beach width at profile EX-P01","m","Example bay, profile EX-P01","SEG-EX-0140",18,D(2015,3,1),11,D(2026,3,1),None,"Beach no longer wide enough to haul boats above high tide","Fish landing site; about 12 boats (fictional)","Levelled beach profile (IMA method)","Beach width threshold (to be agreed, I2)","Medium","EX-SRC-002","Fictional."],
["SO-EX-002","Y","Saltwater intrusion","Well conductivity","µS/cm","Example coastal well","",900,D(2020,5,1),2400,D(2026,5,1),None,"Well no longer used for irrigation","Two smallholder farms (fictional)","Handheld conductivity meter (d077)","Well salinity threshold (to be agreed, I2)","Low","EX-SRC-005","Fictional."]]
so_sh=long_sheet("Slow_Onset_Losses",SO_COLS,SO_ROWS,150)
for rr in range(2,152):
    c=so_sh.cell(rr,12,f'=IF(AND(ISNUMBER(J{rr}),ISNUMBER(H{rr})),J{rr}-H{rr},"")'); c.fill=EXF; c.font=f()
EC_COLS=[("record_id",14,None,True,"Events event_id or Slow_Onset_Losses slow_onset_id this loss belongs to."),
("ecosystem",18,"ecosystem",True,""),
("place",26,None,True,"Reef, bay, swamp or beach name."),
("extent_before_ha",11,None,False,"Area before the event (reference)."),
("extent_after_ha",11,None,False,"Area after the event."),
("condition_before",12,"condition",True,"Condition at the reference date."),
("condition_after",12,"condition",True,"Condition after the event."),
("condition_indicator",28,None,False,"What condition is judged on, e.g. live coral cover %, mangrove canopy, beach usable for turtle nesting."),
("reference_source",22,None,False,"Where the before-state comes from: register ID, survey, imagery date."),
("services_affected",30,None,False,"Ecosystem services reduced: coastal protection, fisheries nursery, tourism, nesting."),
("assessment_date",12,None,False,""),
("source_id",14,None,False,""),("notes",40,None,False,"")]
EC_ROWS=[["EX-2026-0007","Beach / dune","Example bay beach",1.2,1.2,"Good","Fair","Beach usable for turtle nesting","Species and habitats (d050); drone survey","Turtle nesting; recreation; boat landing",D(2026,7,10),"EX-SRC-006","Fictional. Sargassum mats covered the upper beach during nesting season."]]
long_sheet("Ecosystem_Losses",EC_COLS,EC_ROWS,150)
NE_COLS=[("record_id",14,None,True,"Events event_id or Slow_Onset_Losses slow_onset_id."),
("nel_category",26,"nel_category",True,"UNFCCC category of non-economic loss."),
("description",44,None,True,"What was lost, in the words of those affected where possible."),
("community",18,None,False,""),
("groups_affected",26,None,False,"Groups, never names: e.g. older residents, fishers, children at the school."),
("severity",10,"severity",False,"As judged with the community."),
("permanence",14,"permanence",False,""),
("evidence_type",18,"evidence_type",True,""),
("consent_recorded",10,"yes_no",True,"Did people agree to this being recorded? (question I11)"),
("source_id",14,None,False,""),("notes",40,None,False,"")]
NE_ROWS=[["EX-2026-0007","Health","Residents near the landing site reported headaches and nausea while the sargassum decomposed (count only, no names)","Example village","Households within 200 m of the beach","Medium","Temporary","Community session","Y","EX-SRC-005","Fictional."],
["EX-2026-0004","Cultural heritage","Annual fishing festival moved inland because the landing site was flooded","Example village","Fisher families","Low","Temporary","Community session","Y","EX-SRC-005","Fictional."]]
long_sheet("Non_Economic_Losses",NE_COLS,NE_ROWS,150)
RF_COLS=[("record_id",14,None,True,"Events event_id (or hazardous_event_id for island-wide support)."),
("funder_type",24,"funder_type",True,""),
("funder_name",26,None,False,"Division, agency, insurer or organisation."),
("purpose",24,"funding_purpose",True,""),
("amount",12,None,False,"Amount spent or paid. Leave blank if unknown; do not guess."),
("currency",8,None,False,"ISO code, e.g. TTD."),
("price_year",9,None,False,""),
("date",12,None,False,"Date paid or spent."),
("source_id",14,None,False,""),("notes",40,None,False,"")]
RF_ROWS=[["EX-2025-0001","THA","Division of Infrastructure (example)","Recovery",85000,"TTD",2025,D(2025,12,15),"EX-SRC-001","Fictional. Road repair."],
["EX-2025-0003","Households / businesses","Shop owners (example)","Recovery",None,None,None,None,"EX-SRC-004","Fictional. Owners paid for their own clean-up; amount not known."]]
long_sheet("Response_Funding",RF_COLS,RF_ROWS,200)

fc_sh=long_sheet("Field_Checks",FC_COLS,FC_ROWS,200)
for rr in range(2,202):
    E_=f'{fcl("event_id")}{rr}'
    c=fc_sh.cell(rr,FCK.index("event_found")+1,f'=IF({E_}="","",IF(COUNTIF(Events!$A$2:$A${NROW+1},{E_})>0,"OK","Missing"))'); c.fill=EXF; c.font=f()
for col,lo,hi in ((fcl("easting"),733000,776000),(fcl("northing"),1231000,1259000)):
    dv=DataValidation(type="decimal",operator="between",formula1=str(lo),formula2=str(hi),allow_blank=True,showErrorMessage=True,error="Outside Tobago (UTM 20N)"); fc_sh.add_data_validation(dv); dv.add(f"{col}2:{col}201")
ms_sh=long_sheet("Met_Service_IDs",MS_COLS,[],100)
dv=DataValidation(type="list",formula1="=Hazardous_Events!$A$2:$A$121",allow_blank=True,showErrorMessage=True,errorStyle="warning",error="Not on the Hazardous_Events sheet. Add the hazardous event first."); ms_sh.add_data_validation(dv); dv.add(f"{msl('hazardous_event_id')}2:{msl('hazardous_event_id')}101")

SHEET_PRIO=[
("Events",E1,"Hazard map validation; susceptibility training; screening likelihood and consequence; impact chains; DAPP signposts","Every event. Fill all Essential fields; others when known. Every record also needs at least one impact field (QA checks)."),
("Sources and Event_Sources",E1,"Confidence and verification of every record","Every event: at least one source."),
("Field_Checks",E1,"Field-verified status of events; field-confirmed locations and sizes for hazard map validation and susceptibility training","Every site visit by the CRVA team to check an event (form THA-FV-01)."),
("Hazardous_Events",E1,"Rainfall and swell thresholds; links impacts to the driving event; storm-level frequency; Sendai and DELTA","Essential for every rain event, storm or swell that caused impacts (events with those triggers must carry its hazardous_event_id); recommended for dry spells and other drivers."),
("Slow_Onset_Losses",E1,"Slow-onset trend analysis (m030) and DAPP signposts; slow-onset rows of the screening matrix","Each monitored indicator (beach width, well salinity), updated at each survey."),
("Human_Effects",E2,"Social vulnerability (who is hit hardest); Sendai disaggregation","Significant events where a breakdown is known."),
("Damage_Losses",E2,"Sector consequence scores; loss and damage database (d034)","Significant events; physical quantities even without costs."),
("Ecosystem_Losses",E2,"Ecological adaptive capacity (d073); habitat condition ranks for InVEST and the ICVI","Events that visibly damage reefs, seagrass, mangroves or beaches."),
("Non_Economic_Losses",E3,"Values-at-risk layer (d068); vulnerability storylines","Significant events, mainly through parish sessions."),
("Response_Funding",E3,"Coping capacity (financial, d067); loss and damage finance gap","Significant events, when figures are available."),
("Met_Service_IDs",E2,"Links each hazardous event to the official Met Service / WMO hazardous event ID (open question I5); Sendai and DELTA exchange","When the Met Service shares its hazardous event IDs. One row per ID received, including events that caused no recorded impacts in Tobago."),
]
pr=wb.create_sheet("Priorities",1)
pr.column_dimensions["A"].width=26; pr.column_dimensions["B"].width=26; pr.column_dimensions["C"].width=70; pr.column_dimensions["D"].width=50
pr["A1"]="What to fill first, and what each part feeds in the CRVA"; pr["A1"].font=f(True,TEAL,14)
pr["A2"]="1 Essential (Tier 1): needed for Tier 1 outputs, every record.  2 Recommended: when known.  3 Loss & damage extension: significant events only; not needed for Tier 1."; pr["A2"].font=f(i=True,c="5B6C70")
PCOL={E1:"D7EEDF",E2:"DCE9F5",E3:"ECEEEE"}
for j,h in enumerate(["Sheet","Priority","Inputs to (CRVA)","When to fill"],1):
    c=pr.cell(4,j,h); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX
rr=5
for a,b,c_,d_ in SHEET_PRIO:
    for j,v in enumerate((a,b,c_,d_),1):
        c=pr.cell(rr,j,v); c.font=f(b=(j==1)); c.alignment=WR; c.border=BOX
    pr.cell(rr,2).fill=PatternFill("solid",fgColor=PCOL[b]); rr+=1
rr+=1
pr.cell(rr,1,"Fields on the Events sheet").font=f(True,TEAL,12); rr+=1
for j,h in enumerate(["Field","Priority","Inputs to (CRVA)","Required to save?"],1):
    c=pr.cell(rr,j,h); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX
rr+=1
order={E1:0,E2:1,E3:2}
for fld,ty,req,*_ in sorted(FIELDS,key=lambda x:order[PRIO[x[0]][0]]):
    for j,v in enumerate((fld,PRIO[fld][0],PRIO[fld][1],"Yes" if req=="Y" else ("Automatic" if req=="Auto" else ("Conditional (see Data dictionary)" if "*" in req else "No"))),1):
        c=pr.cell(rr,j,v); c.font=f(b=(j==1)); c.alignment=WR; c.border=BOX
    pr.cell(rr,2).fill=PatternFill("solid",fgColor=PCOL[PRIO[fld][0]]); rr+=1
pr.freeze_panes="A5"
# Sendai crosswalk
cw=wb.create_sheet("Sendai crosswalk")
cwh=["Inventory field","DesInventar variable","Sendai indicator","Notes"]
for i,(h,w) in enumerate(zip(cwh,[26,30,22,70]),1):
    c=cw.cell(1,i,h); c.font=f(True,"FFFFFF"); c.fill=HEAD; c.border=BOX; cw.column_dimensions[L(i)].width=w
CW=[
("event_type","Event type","—","Map each type to the 2025 UNDRR–ISC Hazard Information Profile (HIP) and to the national DesInventar event list before export. Agree the mapping once with ODPM."),
("trigger","Cause","—","DesInventar records the cause separately from the event."),
("hazardous_event_id","—","—","DELTA Resilience links one hazardous event to many effect records using a unique ID."),
("date_start / date_end","Date","—",""),
("parish","Geography level 2","—","Tobago is likely one unit at national level 1; parishes give the level below. Check the national database's levels."),
("deaths","Deaths","A-2",""),
("missing","Missing","A-3",""),
("injuries","Injured / ill","B-2",""),
("people_affected","Directly affected","B-1","Count people directly affected only; note indirect effects in notes."),
("people_displaced","Evacuated","B-1 (part)",""),
("people_relocated","Relocated","B-1 (part)",""),
("livelihoods_disrupted","—","B-5","Not a core DesInventar field; Sendai asks for it."),
("dwellings_damaged","Houses damaged","B-3, C-4",""),
("dwellings_destroyed","Houses destroyed","B-4, C-4",""),
("buildings_damaged / destroyed","—","C-3 (non-residential)","Productive assets: shops, hotels, workshops."),
("crops_ha","Crops and woods (ha)","C-2",""),
("livestock_lost","Cattle (livestock)","C-2",""),
("boats_damaged","—","C-2","Fisheries count as agriculture in Sendai C-2."),
("education_facilities_damaged","Education centres","D-3",""),
("health_facilities_damaged","Hospitals / health centres","D-2",""),
("roads_damaged_m","Roads (m)","D-4, C-5",""),
("utilities_affected","Water supply, power, communications (yes/no)","D-5","Record duration as well."),
("facilities_affected","—","D-6 to D-8","Disruption of education, health and other services."),
("road_closed / closure_hours","—","D-5 (local addition)","Local field for the isolation chain IC1."),
("heritage_damaged","—","C-6","Also feeds the values-at-risk layer."),
("est_cost_ttd","Damage value (local currency)","C-1","Direct physical damage only."),
("est_loss_ttd","Losses value (local currency)","—","Income lost and extra costs; used in PDNA/DaLA, not in Sendai C-1."),
("disaggregation","—","A, B (disaggregated)","Free-text summary. For structured, compound disaggregation (sex × age × disability), use the Human_Effects sheet."),
("Human_Effects sheet","—","A, B","Long format, one row per group of people; matches the DELTA and G-DRSF disaggregation model, including time-stamped displacement."),
("Damage_Losses sheet","Sector effect variables","C, D","One row per asset or service, by PDNA/DELTA sector, with physical quantity, damage state, value type, currency and price year."),
("Hazardous_Events sheet","Event (physical)","—","DELTA hazardous event; carries the Met Service's WMO hazardous-event ID when issued, and early-warning details."),
("record_uuid","—","—","Stable unique ID used for exchange with DELTA and other systems."),
("Sources sheet","Source","—","Every record cites at least one source, as DesInventar requires."),
("data_origin / Field_Checks","Source","—","Local addition. Separates who collected the data (data_origin) from whether the CRVA team checked it on site (Field_Checks). Exported as part of the source description."),
("climate_related","—","—","Lets climate-related loss and damage be reported separately from earthquakes, oil spills and other non-climate events."),
("Slow_Onset_Losses sheet","—","—","DELTA records slow-onset events with no minimum threshold; UNFCCC slow-onset work (2012 technical paper and WIM). Indicator-based, with baseline and current values."),
("Ecosystem_Losses sheet","—","—","FRAME-ECO (UNDRR, UNU-EHS, UNEP, 2026): change in ecosystem extent and condition against a reference; DELTA is its implementation platform."),
("Non_Economic_Losses sheet","—","—","UNFCCC categories of non-economic loss (2013 technical paper; WIM plan of action). Qualitative, participatory; no agreed money value."),
("Response_Funding sheet","—","—","Not a Sendai field. Shows support received against losses, for loss and damage finance requests."),
("Met_Service_IDs sheet","—","—","WMO Cataloguing of Hazardous Events: the Met Service's official ID for each hazardous event, copied to wmo_che_id on Hazardous_Events for exchange with ODPM and DELTA."),
("Sources: authority, repeats_source_id","Source","—","Local addition. Records whether a source is from the agency mandated for the claim, and whether it repeats another source, so the Desk-verified rule can be checked."),
]
for k,row in enumerate(CW,2):
    for i,v in enumerate(row,1): c=cw.cell(k,i,v); c.font=f(b=(i==1)); c.alignment=WR; c.border=BOX
cw.freeze_panes="A2"
ORDER=["Read me","Priorities","Events","Hazardous_Events","Sources","Event_Sources","Field_Checks","Met_Service_IDs","Human_Effects","Damage_Losses","Slow_Onset_Losses","Ecosystem_Losses","Non_Economic_Losses","Response_Funding","QA checks","Data dictionary","Sendai crosswalk","Lookups"]
assert set(ORDER)==set(wb.sheetnames), set(ORDER)^set(wb.sheetnames)
wb._sheets=[wb[n] for n in ORDER]
wb.save(XLSX)
if os.path.exists(GPKG): os.remove(GPKG)

# GeoPackage
import geopandas as gpd, pandas as pd
from shapely.geometry import Point
cols=[x[0] for x in FIELDS]
df=pd.DataFrame([{c:e.get(c) for c in cols} for e in EX])
for c in ("date_start","date_end","verification_date","recorded_date"): df[c]=df[c].astype(str).replace("None",None)
# automatic fields, filled the same way as in the workbook and the live inventory
TM=dict(TRIGGER_CLIMATE); df["climate_related"]=df["trigger"].map(lambda t: TM.get(t,"Unclear") if t else None)
THA={r[0] for r in RF_ROWS if r[1]=="THA"}
def _sig(e):
    w=[x for x,ok in (("death",(e.get("deaths") or 0)>0),("building destroyed",(e.get("buildings_destroyed") or 0)>0),("road closed > 24 h",(e.get("closure_hours") or 0)>24),("THA spending",e["event_id"] in THA)) if ok]
    return "Yes ("+", ".join(w)+")" if w else "No"
df["significant"]=[_sig(e) for e in EX]
fdf=pd.DataFrame(FC_ROWS,columns=[c[0] for c in FC_COLS]).drop(columns=["event_found"]).astype(object).where(lambda x: x.notna(),None); fdf["visit_date"]=fdf["visit_date"].astype(str)
g=gpd.GeoDataFrame(df,geometry=[Point(a,b) for a,b in zip(df.easting,df.northing)],crs="EPSG:32620")
g.to_file(GPKG,layer="events",driver="GPKG")
sdf=pd.DataFrame(SRC,columns=SRC_COLS); sdf["source_date"]=sdf["source_date"].astype(str)
gpd.GeoDataFrame(sdf,geometry=[None]*len(sdf)).to_file(GPKG,layer="sources",driver="GPKG")
gpd.GeoDataFrame(pd.DataFrame(LINK,columns=["event_id","source_id"]),geometry=[None]*len(LINK)).to_file(GPKG,layer="event_sources",driver="GPKG")
for nm,cols_,rows_ in (("hazardous_events",HE_COLS,HE_ROWS),("human_effects",HU_COLS,HU_ROWS),("damage_losses",DL_COLS,DL_ROWS),("slow_onset_losses",SO_COLS,SO_ROWS),("ecosystem_losses",EC_COLS,EC_ROWS),("non_economic_losses",NE_COLS,NE_ROWS),("response_funding",RF_COLS,RF_ROWS)):
    t=pd.DataFrame(rows_,columns=[c[0] for c in cols_]).astype(object).where(lambda x: x.notna(),None)
    for c in t.columns:
        if "date" in c: t[c]=t[c].astype(str).replace("None",None)
    gpd.GeoDataFrame(t,geometry=[None]*len(t)).to_file(GPKG,layer=nm,driver="GPKG")
gpd.GeoDataFrame(fdf,geometry=[Point(a,b) for a,b in zip(fdf.easting,fdf.northing)],crs="EPSG:32620").to_file(GPKG,layer="field_checks",driver="GPKG")
lkdf=pd.DataFrame([(k,v) for k,vs in LOOK.items() for v in vs],columns=["list","value"])
gpd.GeoDataFrame(lkdf,geometry=[None]*len(lkdf)).to_file(GPKG,layer="lookups",driver="GPKG")
# Met Service IDs: no examples yet, so the layer is written with its columns and no rows
gpd.GeoDataFrame(pd.DataFrame({c:pd.Series(dtype="object") for c in MSK}),geometry=gpd.GeoSeries([],dtype="geometry")).to_file(GPKG,layer="met_service_ids",driver="GPKG")
print("ok")
