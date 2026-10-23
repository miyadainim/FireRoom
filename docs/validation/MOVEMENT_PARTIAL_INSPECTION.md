# Inspection of user-reviewed partial candidates

October19,2026. User confirms eightcompletedcyclesalignvideo, noaction43–45s, deliberatewristbehindbody51–53s. Sources: comparison665..., rawexport(5) Full67212Hz, supplied fireroom_18_0ct_video.mp4. Qualitativecontactsheet movement-cycle/partial-inspection.png; originalvideohashdiffersrawclipID (transcodingpossible), exactsyncnotestablished. No threshold/implementationchanges.

## Left43–45s

Engineguardorigin established22.667s andfrozen whilearmed. Departuretimestamp43.083, referenceage20.417s. Distancefromorigin hovers.208–.226shoulderspans during43–45s; departgate.22,recoveryradius.20,meaningfulpeak.35. Peak.226meansnotmeaningfulcompletedpunchbutstartaccepted; timeout44.917sproducespartial. ReplayedGuardEstimator(image2D) reportsleftguardthrough43–44.75s, evenwhilecycleFSMisoutward. Guardconfidencehighminimum.9687. Pixel/relativecoordinatesdriftsomewhat; rawdataalonecannotassignallchanges tojitterversusposture/shoulderanchor. Softwareconflictstaleoriginversuscurrentguarddemonstrated. Userreview+imagesdo notsupportattemptedjab. Don't simplyincreasedeparturethresholdbecausegenuineshortcyclesmightbeaffected.

## Right51–53s

Origin42.75s. Departure51.333; eligibleheightpeak51.5s .432shoulderspans. Normalizedwristy(relativeownshoulder)~.001at51.5,.875at51.75,1.435at52; positivey isdown. Video51.5showslowering,52handdown,53handbehindtorso. Engineheight<=.35gatesstartingandoutwardsupportbutnotcontinuation; lowerhandremainsactiveuntil53.167timeout. Visibilitystill~.957at51.5,.966at52,.894at53; no .65thresholdloss. This isnonpunchlowering/occlusionactionperuser, notverifiedfailedcross. Cannotassertalgorithmicallyobservedocclusionsolelyfromconfidence. Alternative honestlabel would be nonpunch/unsupported-direction or uncertainintent; cannotmanufacturegroundtruthhiddenjointposition.

## Next correction design

- Reanchor onlyafterfreshstablelow-motionguard evidence, freezeoriginoncecoherentdeparturebegins; avoidchasinggenuineslow/shortpunches.
- Require temporal coherentoutwardevidence beforecommittingcandidate, ratherthanoneframe .22crossing.
- Classifyclearhandlowering separatelyfromsupportedpunchoutwardphase. Lowvisibility/jump =>uncertain; highvisibilityhiddenjointstillmaynotbeidentifiable.
- Keep eightuserconfirmedcycles asregressioncandidates; independentidle/posture/slowshort/feint/occlusiontests andnewheldoutvideo neededbeforephysicalclaim.

Gate: inspectionrootcausesupportedandindependentlyreviewed; nofixappliedinthisturn. Generalfalsepositiverate, preciseboundaryerrorandocclusionaccuracyNOTVERIFIED.
