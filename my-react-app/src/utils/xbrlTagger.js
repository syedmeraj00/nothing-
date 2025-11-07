export class XBRLTagger {
  static generateTags(data, framework = 'CSRD') {
    const mappings = {
      CSRD: {
        scope1Emissions: 'esrs:DirectGHGEmissions',
        scope2Emissions: 'esrs:IndirectGHGEmissions',
        totalEmployees: 'esrs:TotalNumberOfEmployees'
      },
      GRI: {
        scope1Emissions: 'gri:GRI-305-1',
        scope2Emissions: 'gri:GRI-305-2'
      }
    };

    const tags = {};
    Object.entries(data).forEach(([key, value]) => {
      const tag = mappings[framework]?.[key];
      if (tag) {
        tags[tag] = {
          value,
          contextRef: `${framework}_${new Date().getFullYear()}`,
          unitRef: this.getUnitRef(key),
          decimals: '2'
        };
      }
    });

    return tags;
  }

  static getUnitRef(metric) {
    const units = {
      scope1Emissions: 'tCO2e',
      scope2Emissions: 'tCO2e',
      scope3Emissions: 'tCO2e',
      totalEmployees: 'count'
    };
    return units[metric] || 'pure';
  }

  static generateXBRLDocument(tags, companyInfo) {
    const contexts = Object.keys(tags).map(tag => 
      `<xbrli:context id="${tags[tag].contextRef}">
        <xbrli:entity>
          <xbrli:identifier scheme="http://www.sec.gov/CIK">${companyInfo.cik || '0000000000'}</xbrli:identifier>
        </xbrli:entity>
        <xbrli:period>
          <xbrli:instant>${new Date().toISOString().split('T')[0]}</xbrli:instant>
        </xbrli:period>
      </xbrli:context>`
    ).join('\n');

    const facts = Object.entries(tags).map(([tagName, tagData]) =>
      `<${tagName} contextRef="${tagData.contextRef}" unitRef="${tagData.unitRef}" decimals="${tagData.decimals}">${tagData.value}</${tagName}>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance">
  ${contexts}
  ${facts}
</xbrli:xbrl>`;
  }
}