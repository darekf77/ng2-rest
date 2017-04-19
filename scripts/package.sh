sh scripts/delete_tsc_filtes.sh
tsc
cp src/module.ts src/module.d.ts
sh scripts/plunker_bundle.sh
release-it
sh scripts/delete_tsc_filtes.sh
