Summary of Segment Removal Refactoring

## Changes Made

1. Removed the Segment interface and SegmentType enum
2. Updated the Unit interface to have a required durability property
3. Updated the Subsystem interface to have a new durability threshold based on unit health
4. Renamed segmentUtils.ts to unitUtils.ts and updated its functions
5. Updated combat reducers to use a unified durability system
6. Removed segment targeting from the UI
7. Added TODOs for future combat system improvements

## Next Steps

1. Further improve the combat system to take advantage of the unified durability pool
2. Update special moves to work with the new system
3. Expand subsystem functionality to make it more interesting without segments
4. Create unit tests for the new system
