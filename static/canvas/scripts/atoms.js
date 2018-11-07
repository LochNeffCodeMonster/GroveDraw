
var lib = {
    carbon: {
        atom_type: 'carbon',
        img: carbon_img
    },
    hydrogen: {
        atom_type: 'hydrogen',
        img: hydrogen_img
    },
    bromine: {
        atom_type: 'bromine',
        img: bromine_img
    },
    aluminum: {
        atom_type: 'aluminum',
        img: aluminum_img
    },
    chlorine: {
        atom_type: 'chlorine',
        img: chlorine_img
    },
    fluorine: {
        atom_type: 'fluorine',
        img: fluorine_img
    },
    iodine: {
        atom_type: 'iodine',
        img: iodine_img
    },
    nitrogen: {
        atom_type: 'nitrogen',
        img: nitrogen_img
    },
    phosphorous: {
        atom_type: 'phosphorous',
        img: phosphorous_img
    },
    sulfur: {
        atom_type: 'sulfur',
        img: sulfur_img
    },
    oxygen: {
        atom_type: 'oxygen',
        img: oxygen_img
    },
    selenium: {
        atom_type: 'selenium',
        img: selenium_img
    },
    xenon: {
        atom_type: 'xenon',
        img: xenon_img
    },
    antimony: {
        atom_type: 'antimony',
        img: antimony_img
    }
};


var constructAtom = function (selected_atom) {
    for (var atom in lib){
        if (lib[atom].atom_type === selected_atom){
            return lib[atom]
        }
    }
};