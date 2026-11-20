-- App "Space Shooter" diganti game Blockfall; folder "Resources" bawaan Framer dihapus.
update desktop_items set label = 'Blockfall' where id = 'app-space-shooter';
delete from desktop_items where id = 'app-resources';
