import { gql } from 'graphql-request'




self.deviceFullQuery = gql`query graphvizDeviceQuery($device_id: String!) {
  device(where: {id: {_eq: $device_id}}) {
    added_by
    added_on
    assigned_to
    cost
    description
    wallet_address
    valid
    tags
    notes
    name
    marketing_description
    listing_url
    last_modified_on
    last_modified_by
    image
    id
    device_device_types {
      device_type {
        id
        name
        icon
      }
    }
    device_functions {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cost_model
        cover_photo
        description
        github
        icon
        id
        last_modified_by
        name
        last_modified_on
        ongoing_monthly_subscription
        priority
        sample_output
        size
        source_url
        tags
        upfront_price_credits_to_engage
        wallet_address
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
      }
    }
    device_oem_orgs {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
      }
    }
    device_sp_orgs {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        company_tagline
        crunchbase_profile
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_used
        job_board_link_status
        last_modified_by
        last_modified_on
        linkedn
        logo
        logo_url
        naics_code
        name
        org_chart_link
        product_picture
        product_service_description
        summary_video
        sales_outreach
        website
        wallet_address
        valid
        twitter_handle
        team_page_url
        tags
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
      }
    }
    project_devices {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        description
        dimo_rating
        geocode_cache
        geospatial_data
        id
        import_source_url
        implementation_target_rating
        last_modified_by
        last_modified_on
        name
        tags
        sla
        regulator_orgs
        project_website
        project_screenshots
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
      }
    }
  }
}`

self.deviceSearchQuery = gql`query graphVizDeviceSearch($searchString: String!) {
  device(where: {name: {_ilike: $searchString}}) {
    added_by
    added_on
    assigned_to
    cost
    description
    wallet_address
    valid
    tags
    notes
    name
    marketing_description
    listing_url
    last_modified_on
    last_modified_by
    image
    id
    device_device_types {
      device_type {
        id
        name
        icon
      }
    }
    device_functions {
      function {
        id
        name
      }
    }
    device_oem_orgs {
      organization {
        id
        name
      }
    }
    device_sp_orgs {
      organization {
        id
        name
      }
    }
    project_devices {
      project {
        id
        name
      }
    }
  }
}`














self.projectFullQuery = gql`query graphvizProjectQuery($proj_id: String!) {
  project(where: {id: {_eq: $proj_id}}) {
    access
    added_by
    added_on
    anchor_address
    area_image
    assigned_to
    contacts
    cover_photo
    dimo_rating
    description
    geocode_cache
    geospatial_data
    id
    implementation_target_rating
    import_source_url
    name
    last_modified_on
    last_modified_by
    tags
    sla
    regulator_orgs
    project_screenshots
    zone_area_kml
    wallet_address
    version_history
    valid
    underwriting_model
    thumbnail
    project_website
    project_project_types {
      project_type {
        id
        icon
        name
      }
    }
    function_projects {
      function {
        id
        UI_screenshot
        added_by
        added_on
        blueprint_file
        assigned_to
        blueprint_url
        cost_model
        cover_photo
        description
        icon
        github
        name
        last_modified_on
        last_modified_by
        ongoing_monthly_subscription
        priority
        size
        sample_output
        source_url
        tags
        upfront_price_credits_to_engage
        valid
        wallet_address
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
      }
    }
    org_projects {
      organization {
        id
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        company_tagline
        crunchbase_profile
        employees
        devices_page
        featured_project_link
        github
        functions_page
        headquarters
        job_board_used
        job_board_link_status
        last_modified_by
        last_modified_on
        linkedn
        logo_url
        logo
        name
        naics_code
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        website
        wallet_address
        valid
        team_page_url
        twitter_handle
        tags
        summary_video
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
      }
    }
    project_devices {
      device {
        id
        added_by
        added_on
        assigned_to
        cost
        description
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
      }
    }
    project_resources {
      resource {
        id
        added_by
        added_on
        additional_parking
        attachments
        available_by
        break_room_sq_ft
        classroom_sq_ft
        dedicated_bathrooms
        icon
        geocode
        description
        monthly_rent
        max_classroom_space
        lease_min
        location
        last_modified_on
        last_modified_by
        kitchenette
        notes
        name
        parking_spaces
        number_of_charging_plugs
        recommendation
        secured_parking
        simultaneous_trainees
        status
        tags
        virtual_tour
        valid
        usable_sq_ft
        resource_resource_types {
          resource_type {
            name
            id
            icon
          }
        }
        project_resources {
          project {
            id
            name
          }
        }
        functions_resources {
          function {
            id
            name
          }
        }
        org_resources {
          organization {
            id
            name
          }
        }
      }
    }
  }
}
`
self.projectSearchQuery = gql`query graphVizProjectSearch($searchString: String!) {
  project(where: {name: {_ilike: $searchString}}) {
    access
    added_by
    added_on
    anchor_address
    area_image
    assigned_to
    contacts
    cover_photo
    dimo_rating
    description
    geocode_cache
    geospatial_data
    id
    implementation_target_rating
    import_source_url
    name
    last_modified_on
    last_modified_by
    tags
    sla
    regulator_orgs
    project_screenshots
    zone_area_kml
    wallet_address
    version_history
    valid
    underwriting_model
    thumbnail
    project_website
    project_project_types {
      project_type {
        id
        icon
        name
      }
    }
    function_projects {
      function {
        id
        name
      }
    }
    org_projects {
      organization {
        id
        name
      }
    }
    project_devices {
      device {
        id
        name
      }
    }
  }
}`







self.orgFullQuery = gql`query graphvizOrgQuery($org_id: String!) {
  organization(where: {id: {_eq: $org_id}}) {
    added_by
    added_on
    assigned_to
    bd_tier
    category_example
    capital_raised
    crunchbase_profile
    company_tagline
    company_email
    devices_page
    employees
    functions_page
    github
    headquarters
    id
    job_board_used
    job_board_link_status
    last_modified_by
    last_modified_on
    logo
    linkedn
    name
    naics_code
    logo_url
    org_chart_link
    product_picture
    website
    wallet_address
    valid
    twitter_handle
    team_page_url
    tags
    summary_video
    sales_outreach
    product_service_description
    org_org_types {
      org_type {
        icon
        name
        id
      }
    }
    device_oem_orgs {
      device {
        added_by
        added_on
        assigned_to
        cost
        description
        id
        image
        last_modified_by
        listing_url
        last_modified_on
        notes
        name
        marketing_description
        tags
        valid
        wallet_address
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
      }
    }
    device_sp_orgs {
      device {
        added_by
        added_on
        assigned_to
        cost
        description
        id
        image
        last_modified_by
        last_modified_on
        listing_url
        notes
        name
        marketing_description
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
      }
    }
    function_sp_orgs {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cover_photo
        cost_model
        description
        icon
        github
        ongoing_monthly_subscription
        name
        last_modified_on
        id
        last_modified_by
        priority
        sample_output
        size
        tags
        source_url
        wallet_address
        upfront_price_credits_to_engage
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
      }
    }
    org_projects {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        dimo_rating
        description
        geocode_cache
        geospatial_data
        id
        implementation_target_rating
        import_source_url
        name
        last_modified_on
        last_modified_by
        project_screenshots
        tags
        sla
        regulator_orgs
        project_website
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
      }
    }
    org_resources {
      resource {
        id
        added_by
        added_on
        additional_parking
        attachments
        available_by
        break_room_sq_ft
        classroom_sq_ft
        dedicated_bathrooms
        icon
        geocode
        description
        monthly_rent
        max_classroom_space
        lease_min
        location
        last_modified_on
        last_modified_by
        kitchenette
        notes
        name
        parking_spaces
        number_of_charging_plugs
        recommendation
        secured_parking
        simultaneous_trainees
        status
        tags
        virtual_tour
        valid
        usable_sq_ft
        resource_resource_types {
          resource_type {
            name
            id
            icon
          }
        }
        project_resources {
          project {
            id
            name
          }
        }
        functions_resources {
          function {
            id
            name
          }
        }
        org_resources {
          organization {
            id
            name
          }
        }
      }
    }
  }
}`

self.orgSearchQuery = gql`query graphvizOrgSearchQuery($searchString: String!) {
  organization(where: {name: {_ilike: $searchString}}) {
    added_by
    added_on
    assigned_to
    bd_tier
    category_example
    capital_raised
    crunchbase_profile
    company_tagline
    company_email
    devices_page
    employees
    functions_page
    github
    headquarters
    id
    job_board_used
    job_board_link_status
    last_modified_by
    last_modified_on
    logo
    linkedn
    name
    naics_code
    logo_url
    org_chart_link
    product_picture
    website
    wallet_address
    valid
    twitter_handle
    team_page_url
    tags
    summary_video
    sales_outreach
    product_service_description
    org_org_types {
      org_type {
        icon
        name
        id
      }
    }
    device_oem_orgs {
      device {
        id
        name
      }
    }
    device_sp_orgs {
      device {
        id
        name
      }
    }
    function_sp_orgs {
      function {
        name
        id
      }
    }
    org_projects {
      project {
        id
        name
      }
    }
  }
}

`






self.functionFullQuery = gql`query graphvizFunctionQuery($function_id: String!) {
  function(where: {id: {_eq: $function_id}}) {
    UI_screenshot
    added_by
    added_on
    assigned_to
    cover_photo
    cost_model
    blueprint_url
    blueprint_file
    description
    name
    ongoing_monthly_subscription
    last_modified_on
    last_modified_by
    id
    icon
    github
    priority
    wallet_address
    valid
    upfront_price_credits_to_engage
    tags
    source_url
    size
    sample_output
    function_function_types {
      function_type {
        icon
        id
        name
      }
    }
    device_functions {
      device {
        added_by
        added_on
        assigned_to
        cost
        description
        id
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
        device_device_types {
          device_type {
            id
            name
            icon
          }
        }
        device_functions {
          function {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
      }
    }
    function_projects {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        dimo_rating
        description
        geocode_cache
        geospatial_data
        id
        implementation_target_rating
        import_source_url
        last_modified_by
        last_modified_on
        name
        regulator_orgs
        project_website
        project_screenshots
        tags
        sla
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
      }
    }
    function_sp_orgs {
      organization {
        added_by
        added_on
        assigned_to
        crunchbase_profile
        company_tagline
        company_email
        category_example
        capital_raised
        bd_tier
        featured_project_link
        employees
        devices_page
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        last_modified_by
        last_modified_on
        linkedn
        logo
        logo_url
        naics_code
        name
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        wallet_address
        website
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
      }
    }
    functions_resources {
      resource {
        id
        added_by
        added_on
        additional_parking
        attachments
        available_by
        break_room_sq_ft
        classroom_sq_ft
        dedicated_bathrooms
        icon
        geocode
        description
        monthly_rent
        max_classroom_space
        lease_min
        location
        last_modified_on
        last_modified_by
        kitchenette
        notes
        name
        parking_spaces
        number_of_charging_plugs
        recommendation
        secured_parking
        simultaneous_trainees
        status
        tags
        virtual_tour
        valid
        usable_sq_ft
        resource_resource_types {
          resource_type {
            name
            id
            icon
          }
        }
        project_resources {
          project {
            id
            name
          }
        }
        functions_resources {
          function {
            id
            name
          }
        }
        org_resources {
          organization {
            id
            name
          }
        }
      }
    }
  }
}`

self.functionSearchQuery = gql`query graphvizFunctionQuery($searchString: String!) {
  function(where: {name: {_ilike: $searchString}}) {
    UI_screenshot
    added_by
    added_on
    assigned_to
    cover_photo
    cost_model
    blueprint_url
    blueprint_file
    description
    name
    ongoing_monthly_subscription
    last_modified_on
    last_modified_by
    id
    icon
    github
    priority
    wallet_address
    valid
    upfront_price_credits_to_engage
    tags
    source_url
    size
    sample_output
    function_function_types {
      function_type {
        icon
        id
        name
      }
    }
    device_functions {
      device {
        name
        id
      }
    }
    function_projects {
      project {
        name
        id
      }
    }
    function_sp_orgs {
      organization {
        name
        id
      }
    }
  }
}

`



self.resourceFullQuery = gql`query graphvizResourceQuery($resource_id: String!) {
  resource(where: {id: {_eq: $resource_id}}) {
    id
    added_by
    added_on
    additional_parking
    attachments
    available_by
    break_room_sq_ft
    classroom_sq_ft
    dedicated_bathrooms
    icon
    geocode
    description
    monthly_rent
    max_classroom_space
    lease_min
    location
    last_modified_on
    last_modified_by
    kitchenette
    notes
    name
    parking_spaces
    number_of_charging_plugs
    recommendation
    secured_parking
    simultaneous_trainees
    status
    tags
    virtual_tour
    valid
    usable_sq_ft
    resource_resource_types {
      resource_type {
        name
        id
        icon
      }
    }
    project_resources {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        dimo_rating
        description
        geocode_cache
        geospatial_data
        id
        implementation_target_rating
        import_source_url
        name
        last_modified_on
        last_modified_by
        project_screenshots
        tags
        sla
        regulator_orgs
        project_website
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
        project_project_types {
          project_type {
            id
            icon
            name
          }
        }
        function_projects {
          function {
            id
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
      }
    }
    functions_resources {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cover_photo
        cost_model
        description
        icon
        github
        ongoing_monthly_subscription
        name
        last_modified_on
        id
        last_modified_by
        priority
        sample_output
        size
        tags
        source_url
        wallet_address
        upfront_price_credits_to_engage
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
      }
    }
    org_resources {
      organization {
        id
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        company_tagline
        crunchbase_profile
        employees
        devices_page
        featured_project_link
        github
        functions_page
        headquarters
        job_board_used
        job_board_link_status
        last_modified_by
        last_modified_on
        linkedn
        logo_url
        logo
        name
        naics_code
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        website
        wallet_address
        valid
        team_page_url
        twitter_handle
        tags
        summary_video
        org_org_types {
          org_type {
            icon
            name
            id
          }
        }
        device_oem_orgs {
          device {
            id
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }
      }
    }
  }
}`

self.resourceSearchQuery = gql`query graphvizResourceQuery($searchString: String!) {
  resource(where: {name: {_ilike: $searchString}}) {
    id
    added_by
    added_on
    additional_parking
    attachments
    available_by
    break_room_sq_ft
    classroom_sq_ft
    dedicated_bathrooms
    icon
    geocode
    description
    monthly_rent
    max_classroom_space
    lease_min
    location
    last_modified_on
    last_modified_by
    kitchenette
    notes
    name
    parking_spaces
    number_of_charging_plugs
    recommendation
    secured_parking
    simultaneous_trainees
    status
    tags
    virtual_tour
    valid
    usable_sq_ft
    resource_resource_types {
      resource_type {
        name
        id
        icon
      }
    }
    project_resources {
      project {
        id
        name
      }
    }
    functions_resources {
      function {
        id
        name
      }
    }
    org_resources {
      organization {
        id
        name
      }
    }
  }
}`



