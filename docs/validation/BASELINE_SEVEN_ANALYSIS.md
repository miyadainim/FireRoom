# Relabeled baseline (7) — October 19, 2026

User reports Full overlay broadly matches body with wrist/elbow flicker. Export validates: same480pose samples/model as(6), only labelschanged. Originalsource unchanged. RecomputedcurrentTrackingLab metrics; matchinguserreviewsupports2Dqualitatively, notworldaccuracy. No manualjointannotations.

|Full median reference|Guard|Extended|Short|
|---|---:|---:|---:|
|Left image2D px|35.98|76.79|67.13|
|Right image2D px|40.71|105.03|81.69|
|Left inferredworld cm|28.74|42.85|33.06|
|Right inferredworld cm|28.27|35.96|26.08|

Extended>short inbothhands/modes afterrelabeling. Baselineaveragesnotheldoutaccuracy: oneheldreferenceeach; nolearnedclassifier orpassrate. Short-rightworldbelowguard ispossible geometricconfiguration andrequiresreview; do nottreatreachasmonotonicguard→short→full. Heavyalsohasextended>shortmedians butabsoluteestimatedworldreferencesdiffer.

Originalnewwindows:guard8–13,leftfull14–20,rightfull21–28,leftshort28–34,rightshort35–38. Sampledvideo14stillguard and21leftout, so firstpartsofholdsinclude transitions/otherpose. Shared28s endpoint contributes tobothrightfull/leftshort. Robustmediansimprovebutstableinteriorsremainpreferable. Exactvideosyncnotframeannotated. Suggestedreviewinteriors16–19.5,23–27,30–33.5,36–37.8; provisional, notautomaticallyapplied.

Jitter diagnostic: rawimagejoint coordinates relative same-side shoulder, successive83.33ms displacement in stablevideo-guidedinteriors8.5–12.5,16–19.5,23–27,30–33.5,36–37.8seconds. 201pairs/joint, no smoothing, pixelsat480x640. Full medianleftelbow.70,wrist.77,rightelbow.70,wrist.99px; p952.30/2.34/3.95/5.14px; max6.09/5.39/11.13/9.55px. Heavy p951.54/1.66/1.62/2.98px. Includes realphysicalmotion andestimationnoise; cannotassignalltoMediaPipe. Smoothernotproofmoreaccurate. Rawpreserved.

Gate: descriptivebaseline separation supported; productionformgrading/physicalaccuracy NOTVERIFIED. Userdoesnotneedrerecordsolelyforlabels. RetainFullcandidate, usefuturefiltercomparisonwithinrawdata, verifyholdinteriors beforeusingbaselineforheldoutgrading. No productionchanges; existing284testevidence notnewtestsforanalysis.
