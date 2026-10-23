# First live prescribed exports — October19

Inputs user fireroom_trials/fireroom-prescribed-attempt.json and (1).json. Both envelopekindfireroom-prescribed-live-attempt containmatchingconfig/frames/rules, samecamerasession. No video supplied. Theseareliveexportevidence, notphysicaljudgmentgroundtruth. Nomodelselectionmetadataavailable;donotassumeFullfrompriorlab.

Jab:71frames,orthodox5swindow29098.3–34098.3producerms. Completedleftcycledeparture30322.3,peak31285.8,recovery31951.8,end32106.8. Relativewindow1.224sdeparture,2.188speak,2.854sreturn. Recoverytime666msdescriptive. Initialguard3/3supported,oppositeguard12/12supported,recoveredguard5/6supported; wristoriginreturnobserved. FormstatusNOTVERIFIED,extensioncannotassess:viewpointwarningandnoreviewedreference. Oppositearmadjustmentnotcountedsecondpunch.

Cross:67frames,orthodox5swindow74383–79383. Rightcycledeparture75259.8,peak75651.1,partial77126.6;1.8668sactive >1800msenginebound. Currentengineevaluatestimeoutbeforeitsreturnbranch. Same77126.6observationwristalready.107shoulderspansfromsavedorigin (inside.20recoveryradius). IndependentGuardEstimatorreportsrightguardnextframe~77201ms (2.818saftercue)andthroughremainingwindow. Thus rejected report cannotestablishfailedphysicalrecovery; source-levelhardtimeoutconflictswithbounded5sresponsewindow. Stable80msrecoverywouldneedmoreobservationsbeyondfirstreturn, whichwereavailableinsideguidedwindow. Peak→firstnear-origin~1475.5msdescriptive, notuniversaltoo-slowgrade. No footage toverifytruejointplacement/speed.

Nextcorrection: makeboundedattemptcyclelimitexplicitlycompatiblewithprescribedresponsewindow instead of inheritingunrestricted1.8stimeout. Preservefinitewindow/gaps/wronghand/order/idlechecks, keep recoverytimingseparatefromtechniquejudgment. Addrecordedregression retainingearlyguardreturn and testsidle/reach/timeouts; nofixappliedinthisanalysis. PhysicalcoachingaccuracyNV.

## Resolution: prescribed-window-v2

The prescribed evaluator now supplies its bounded response deadline to the movement engine. Replaying these same exports recognizes both jab and cross, without changing the unrestricted 1.8-second timeout. Cross return at 77126.6 ms is followed by held-guard confirmation at 77278.5 ms. Extension remains cannot assess. Regression: 393 tests PASS; production build PASS; independent corrective gate PASS. Physical form and a fresh real-phone walkthrough remain NOT VERIFIED.
